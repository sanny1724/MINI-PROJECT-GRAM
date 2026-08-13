"""
Seed demo accounts for GRAM (Citizen, Panchayat, Collector).
"""
import sys
from pathlib import Path

# Fix Windows console UTF-8 output
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal
from app.models.user import User, RoleEnum
from app.models.village import Village
from app.models.geo import Mandal, District
from app.auth.security import hash_password


def seed_demo_users():
    db = SessionLocal()
    try:
        # Find Ankapur village
        v = db.query(Village).filter(Village.lgd_code == "569005").first()
        if not v:
            v = db.query(Village).first()
            
        if not v:
            print("Error: No villages found in database. Seed LGD data first.")
            return

        mandal = v.mandal
        district = mandal.district if mandal else None

        print(f"Target Village: {v.name} (LGD: {v.lgd_code})")
        if mandal:
            print(f"Target Mandal: {mandal.name} (LGD: {mandal.lgd_code})")
        if district:
            print(f"Target District: {district.name} (LGD: {district.lgd_code})")

        # 1. Citizen
        email_citizen = "citizen@example.com"
        c_user = db.query(User).filter(User.email == email_citizen).first()
        if not c_user:
            c_user = User(
                full_name="Citizen Sannith",
                email=email_citizen,
                hashed_password=hash_password("password123"),
                role=RoleEnum.citizen,
                village_id=v.id,
                must_reset_password=False
            )
            db.add(c_user)
            print(f"Created Citizen: {email_citizen} / password123")

        # 2. Panchayat Secretary
        email_panchayat = "panchayat@example.com"
        p_user = db.query(User).filter(User.email == email_panchayat).first()
        if not p_user:
            p_user = User(
                full_name=f"Panchayat Secretary - {v.name}",
                email=email_panchayat,
                hashed_password=hash_password("password123"),
                role=RoleEnum.panchayat,
                village_id=v.id,
                must_reset_password=False
            )
            db.add(p_user)
            print(f"Created Panchayat Secretary: {email_panchayat} / password123")

        # 3. District Collector
        email_collector = "collector@example.com"
        coll_user = db.query(User).filter(User.email == email_collector).first()
        if not coll_user:
            coll_user = User(
                full_name=f"District Collector - {district.name if district else 'Adilabad'}",
                email=email_collector,
                hashed_password=hash_password("password123"),
                role=RoleEnum.collector,
                district_id=district.id if district else None,
                must_reset_password=False
            )
            db.add(coll_user)
            print(f"Created District Collector: {email_collector} / password123")

        db.commit()
        print("[OK] Demo users seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_users()
