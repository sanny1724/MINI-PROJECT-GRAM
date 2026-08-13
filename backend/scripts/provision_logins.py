"""
Bulk-provision one placeholder login per administrative unit, after
District/Mandal/Village data has been imported (see import_lgd_data.py):

  - one 'panchayat' account per Village
  - one 'tahsildar' account per Mandal
  - one 'collector' account per District

Each account gets a random temporary password and must_reset_password=True,
so the real official is forced to set their own password on first login
(the frontend should check the `must_reset_password` flag returned by
POST /api/auth/login and route to a "set your password" screen before
letting them into their dashboard — call POST /api/auth/reset-password
with the temp password as current_password and their new password).

Citizens are NOT provisioned here — they self-register normally via
POST /api/auth/register with role=citizen and their village_id.

Safe to re-run: a unit that already has an account for its role is skipped,
so this won't create duplicates if villages/mandals/districts are imported
incrementally over time.

USAGE
----------------------
    python scripts/provision_logins.py --out credentials.csv

Hand `credentials.csv` to the relevant department (Panchayat Raj / Revenue)
so they can distribute the temp password + email to the actual official for
each unit. Do NOT commit this file or leave it lying around — it's a
one-time bootstrap list of live credentials.
"""
import argparse
import csv
import secrets
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal
from app.models.user import User, RoleEnum
from app.models.village import Village
from app.models.geo import Mandal, District
from app.auth.security import hash_password


def _temp_password() -> str:
    # short, typeable temp password (not meant to be memorized long-term)
    return secrets.token_urlsafe(6)


def provision(out_path: str):
    db = SessionLocal()
    rows = []

    try:
        # Panchayat accounts — one per village
        villages = db.query(Village).all()
        created = 0
        for v in villages:
            existing = db.query(User).filter(
                User.village_id == v.id, User.role == RoleEnum.panchayat
            ).first()
            if existing:
                continue
            slug = v.lgd_code or str(v.id)
            email = f"panchayat.{slug}@gram-officials.in"
            password = _temp_password()
            user = User(
                full_name=f"Panchayat Secretary - {v.name}",
                email=email,
                hashed_password=hash_password(password),
                role=RoleEnum.panchayat,
                village_id=v.id,
                must_reset_password=True,
            )
            db.add(user)
            rows.append({"role": "panchayat", "unit": v.name, "email": email, "temp_password": password})
            created += 1
            if created % 500 == 0:
                db.commit()
                print(f"  ...{created} panchayat accounts so far")
        db.commit()
        print(f"Panchayat accounts created: {created}")

        # Tahsildar accounts — one per mandal
        mandals = db.query(Mandal).all()
        created = 0
        for m in mandals:
            existing = db.query(User).filter(
                User.mandal_id == m.id, User.role == RoleEnum.tahsildar
            ).first()
            if existing:
                continue
            slug = m.lgd_code or str(m.id)
            email = f"tahsildar.{slug}@gram-officials.in"
            password = _temp_password()
            user = User(
                full_name=f"Tahsildar - {m.name}",
                email=email,
                hashed_password=hash_password(password),
                role=RoleEnum.tahsildar,
                mandal_id=m.id,
                must_reset_password=True,
            )
            db.add(user)
            rows.append({"role": "tahsildar", "unit": m.name, "email": email, "temp_password": password})
            created += 1
        db.commit()
        print(f"Tahsildar accounts created: {created}")

        # Collector accounts — one per district
        districts = db.query(District).all()
        created = 0
        for d in districts:
            existing = db.query(User).filter(
                User.district_id == d.id, User.role == RoleEnum.collector
            ).first()
            if existing:
                continue
            slug = d.lgd_code or str(d.id)
            email = f"collector.{slug}@gram-officials.in"
            password = _temp_password()
            user = User(
                full_name=f"Collector - {d.name}",
                email=email,
                hashed_password=hash_password(password),
                role=RoleEnum.collector,
                district_id=d.id,
                must_reset_password=True,
            )
            db.add(user)
            rows.append({"role": "collector", "unit": d.name, "email": email, "temp_password": password})
            created += 1
        db.commit()
        print(f"Collector accounts created: {created}")

    finally:
        db.close()

    if rows:
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["role", "unit", "email", "temp_password"])
            writer.writeheader()
            writer.writerows(rows)
        print(f"\nWrote {len(rows)} new credentials to {out_path}")
    else:
        print("\nNo new accounts needed — everything already provisioned.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Bulk-provision village/mandal/district logins")
    parser.add_argument("--out", default="credentials.csv", help="Output CSV path for new credentials")
    args = parser.parse_args()

    provision(args.out)
