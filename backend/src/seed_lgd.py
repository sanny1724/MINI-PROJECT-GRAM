import os
import sys
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

def load_db_url():
    env_path = r"c:\Users\sravs\Downloads\New folder\backend\ .env".replace(" ", "")
    if not os.path.exists(env_path):
        env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    
    print(f"Loading env from {env_path}")
    db_url = None
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip().startswith("DATABASE_URL="):
                val = line.split("=", 1)[1].strip()
                # Remove quotes if present
                if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                    val = val[1:-1]
                db_url = val
                break
    return db_url

def seed():
    db_url = load_db_url()
    if not db_url:
        print("Error: DATABASE_URL not found in .env", file=sys.stderr)
        sys.exit(1)
        
    print("Connecting to database...")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # 1. State
    print("Seeding State...")
    cur.execute('INSERT INTO "State" (code, name) VALUES (36, \'Telangana\') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name')
    conn.commit()
    
    # 2. Districts
    print("Reading districts...")
    districts_path = r"c:\Users\sravs\Downloads\New folder\backend\data\districts.xlsx"
    df_dist = pd.read_excel(districts_path, header=1)
    
    # Rename columns to standard names
    df_dist = df_dist.rename(columns={
        'District Code': 'code',
        'District Name(In English)': 'name',
        'District Name(In Local)': 'nameLocal'
    })
    
    # Deduplicate and clean
    df_dist = df_dist[['code', 'name', 'nameLocal']].dropna(subset=['code'])
    df_dist['code'] = df_dist['code'].astype(int)
    df_dist['stateCode'] = 36
    df_dist = df_dist.drop_duplicates(subset=['code'])
    
    print(f"Inserting {len(df_dist)} districts...")
    dist_data = [tuple(x) for x in df_dist[['code', 'name', 'nameLocal', 'stateCode']].itertuples(index=False)]
    execute_values(cur, """
        INSERT INTO "District" (code, name, "nameLocal", "stateCode")
        VALUES %s
        ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            "nameLocal" = EXCLUDED."nameLocal",
            "stateCode" = EXCLUDED."stateCode"
    """, dist_data)
    conn.commit()
    
    # 3. Mandals
    print("Reading mandals...")
    mandals_path = r"c:\Users\sravs\Downloads\New folder\backend\data\mandals.xlsx"
    df_mandal = pd.read_excel(mandals_path, header=1)
    
    df_mandal = df_mandal.rename(columns={
        'Sub-district Code': 'code',
        'Sub-district Name (In English)': 'name',
        'Sub-district Name (In Local)': 'nameLocal',
        'District Code': 'districtCode'
    })
    
    df_mandal = df_mandal[['code', 'name', 'nameLocal', 'districtCode']].dropna(subset=['code', 'districtCode'])
    df_mandal['code'] = df_mandal['code'].astype(int)
    df_mandal['districtCode'] = df_mandal['districtCode'].astype(int)
    df_mandal = df_mandal.drop_duplicates(subset=['code'])
    
    # Make sure referencing districts exist
    valid_districts = set(df_dist['code'])
    df_mandal = df_mandal[df_mandal['districtCode'].isin(valid_districts)]
    
    print(f"Inserting {len(df_mandal)} mandals...")
    mandal_data = [tuple(x) for x in df_mandal[['code', 'name', 'nameLocal', 'districtCode']].itertuples(index=False)]
    execute_values(cur, """
        INSERT INTO "Mandal" (code, name, "nameLocal", "districtCode")
        VALUES %s
        ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            "nameLocal" = EXCLUDED."nameLocal",
            "districtCode" = EXCLUDED."districtCode"
    """, mandal_data)
    conn.commit()
    
    # 4. Villages
    print("Reading villages...")
    villages_path = r"c:\Users\sravs\Downloads\New folder\backend\data\villages.xlsx"
    df_village = pd.read_excel(villages_path, header=1)
    
    df_village = df_village.rename(columns={
        'Village Code': 'code',
        'Village Name (In English)': 'name',
        'Village Name (In Local)': 'nameLocal',
        'Sub-District Code': 'mandalCode',
        'Village Category': 'category',
        'Village Status': 'status'
    })
    
    df_village = df_village[['code', 'name', 'nameLocal', 'mandalCode', 'category', 'status']].dropna(subset=['code', 'mandalCode'])
    df_village['code'] = df_village['code'].astype(int)
    df_village['mandalCode'] = df_village['mandalCode'].astype(int)
    df_village = df_village.drop_duplicates(subset=['code'])
    
    # Make sure referencing mandals exist
    valid_mandals = set(df_mandal['code'])
    df_village = df_village[df_village['mandalCode'].isin(valid_mandals)]
    
    # Handle category and status NaN
    df_village['category'] = df_village['category'].fillna('')
    df_village['status'] = df_village['status'].fillna('')
    
    print(f"Inserting {len(df_village)} villages...")
    village_data = [tuple(x) for x in df_village[['code', 'name', 'nameLocal', 'mandalCode', 'category', 'status']].itertuples(index=False)]
    
    # Insert in chunks of 2000 to avoid cursor argument limits
    chunk_size = 2000
    for i in range(0, len(village_data), chunk_size):
        chunk = village_data[i:i+chunk_size]
        execute_values(cur, """
            INSERT INTO "Village" (code, name, "nameLocal", "mandalCode", category, status)
            VALUES %s
            ON CONFLICT (code) DO UPDATE SET
                name = EXCLUDED.name,
                "nameLocal" = EXCLUDED."nameLocal",
                "mandalCode" = EXCLUDED."mandalCode",
                category = EXCLUDED.category,
                status = EXCLUDED.status
        """, chunk)
        print(f"Inserted villages chunk {i} to {i+len(chunk)}")
        
    conn.commit()
    cur.close()
    conn.close()
    print("LGD master data seeding completed successfully!")

if __name__ == '__main__':
    seed()
