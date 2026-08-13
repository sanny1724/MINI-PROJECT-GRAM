"""
Import Telangana District -> Mandal -> Village data from the official LGD Excel files.
"""
import sys
import argparse
from pathlib import Path
import pandas as pd

# Fix Windows console UTF-8 output
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal, Base, engine
from app.models.geo import District, Mandal
from app.models.village import Village


def clean_name(val):
    if pd.isna(val):
        return ""
    return str(val).strip().title()


def import_excel_data(districts_path, mandals_path, villages_path, state="Telangana"):
    print("Initializing database tables...")
    # Drop and re-create to ensure schema constraints match
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. DISTRICTS
        print(f"\nReading districts from {districts_path}...")
        df_d = pd.read_excel(districts_path, header=1)
        district_map = {}  # code/name -> District instance

        for _, row in df_d.iterrows():
            d_code = str(row["District Code"]).strip() if pd.notna(row.get("District Code")) else None
            d_name = clean_name(row.get("District Name(In English)"))
            if not d_name:
                continue

            d = db.query(District).filter(District.name == d_name, District.state == state).first()
            if not d:
                d = District(name=d_name, state=state, lgd_code=d_code)
                db.add(d)
                db.flush()
            elif d_code and not d.lgd_code:
                d.lgd_code = d_code

            district_map[d_code] = d
            district_map[d_name.lower()] = d

        db.commit()
        print(f"[OK] Districts imported/synced successfully.")

        # 2. MANDALS (Sub-districts)
        print(f"\nReading mandals from {mandals_path}...")
        df_m = pd.read_excel(mandals_path, header=1)
        mandal_map = {}  # (district_id, mandal_code/name) -> Mandal

        for _, row in df_m.iterrows():
            d_code = str(row["District Code"]).strip() if pd.notna(row.get("District Code")) else None
            d_name = clean_name(row.get("District Name"))
            m_code = str(row["Sub-district Code"]).strip() if pd.notna(row.get("Sub-district Code")) else None
            m_name = clean_name(row.get("Sub-district Name (In English)"))

            if not m_name:
                continue

            district = district_map.get(d_code) or district_map.get(d_name.lower())
            if not district:
                district = District(name=d_name or "Unknown", state=state, lgd_code=d_code)
                db.add(district)
                db.flush()
                district_map[d_code] = district
                district_map[d_name.lower()] = district

            m = db.query(Mandal).filter(Mandal.name == m_name, Mandal.district_id == district.id).first()
            if not m:
                m = Mandal(name=m_name, district_id=district.id, lgd_code=m_code)
                db.add(m)
                db.flush()
            elif m_code and not m.lgd_code:
                m.lgd_code = m_code

            mandal_map[(district.id, m_code)] = m
            mandal_map[(district.id, m_name.lower())] = m
            mandal_map[m_code] = m

        db.commit()
        print(f"[OK] Mandals imported/synced successfully.")

        # 3. VILLAGES
        print(f"\nReading villages from {villages_path}...")
        df_v = pd.read_excel(villages_path, header=1)
        village_count = 0
        skipped = 0

        for _, row in df_v.iterrows():
            d_code = str(row["District Code"]).strip() if pd.notna(row.get("District Code")) else None
            d_name = clean_name(row.get("District Name (In English)"))
            m_code = str(row["Sub-District Code"]).strip() if pd.notna(row.get("Sub-District Code")) else None
            m_name = clean_name(row.get("Sub-District Name (In English)"))
            v_code = str(row["Village Code"]).strip() if pd.notna(row.get("Village Code")) else None
            v_name = clean_name(row.get("Village Name (In English)"))

            if not v_name:
                continue

            district = district_map.get(d_code) or district_map.get(d_name.lower())
            mandal = None
            if district:
                mandal = mandal_map.get((district.id, m_code)) or mandal_map.get((district.id, m_name.lower()))
            if not mandal:
                mandal = mandal_map.get(m_code)

            if not mandal:
                skipped += 1
                continue

            # Match by lgd_code if available
            existing = None
            if v_code:
                existing = db.query(Village).filter(Village.lgd_code == v_code).first()
            if not existing:
                existing = db.query(Village).filter(
                    Village.name == v_name, Village.mandal_id == mandal.id
                ).first()

            if existing:
                if v_code and not existing.lgd_code:
                    existing.lgd_code = v_code
                continue

            village = Village(
                name=v_name,
                mandal_id=mandal.id,
                lgd_code=v_code or None,
            )
            db.add(village)
            village_count += 1

            if village_count % 1000 == 0:
                db.commit()
                print(f"  ... {village_count} villages imported so far")

        db.commit()
        print(f"[OK] Villages imported: {village_count} new (Skipped/Existing: {skipped})")

        # Summary counts
        total_d = db.query(District).count()
        total_m = db.query(Mandal).count()
        total_v = db.query(Village).count()
        print(f"\n==========================================")
        print(f"DATABASE SUMMARY (Telangana LGD)")
        print(f"   Districts: {total_d}")
        print(f"   Mandals:   {total_m}")
        print(f"   Villages:  {total_v}")
        print(f"==========================================")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during import: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import LGD Telangana administrative hierarchy")
    parser.add_argument("--districts", default="C:/Users/sravs/Downloads/Districtof_Specific_State_2026-07-25_23-19-34.xlsx")
    parser.add_argument("--mandals", default="C:/Users/sravs/Downloads/Sub_Districtof_Specific_State_2026-07-25_23-20-24.xlsx")
    parser.add_argument("--villages", default="C:/Users/sravs/Downloads/Villageof_Specific_State_2026-07-25_23-22-30.xlsx")
    parser.add_argument("--state", default="Telangana")
    args = parser.parse_args()

    # Remove existing partial sqlite db to rebuild cleanly
    db_file = Path("gram.db")
    if db_file.exists():
        try:
            db_file.unlink()
        except Exception:
            pass

    import_excel_data(args.districts, args.mandals, args.villages, args.state)
