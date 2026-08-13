-- GRAM (Governance Risk & Accountability Monitor) — PostgreSQL schema
-- Note: in dev, FastAPI/SQLAlchemy creates these tables automatically via
-- Base.metadata.create_all(). This file is kept as an explicit reference /
-- for manual DB setup and for the Alembic migration baseline.

CREATE TYPE role_enum AS ENUM ('citizen', 'panchayat', 'tahsildar', 'collector');

-- Admin hierarchy: District -> Mandal -> Village, each seedable from the
-- official LGD (Local Government Directory, lgdirectory.gov.in) dataset via
-- backend/scripts/import_lgd_data.py. lgd_code columns store the official
-- LGD code when data is imported from there (null for manually-added entries).

CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    state VARCHAR(150) NOT NULL DEFAULT 'Telangana',
    lgd_code VARCHAR(20) UNIQUE,
    UNIQUE (name, state)
);

CREATE TABLE mandals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    lgd_code VARCHAR(20) UNIQUE,
    UNIQUE (name, district_id)
);
CREATE INDEX idx_mandals_district ON mandals(district_id);

CREATE TABLE villages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    mandal_id INTEGER NOT NULL REFERENCES mandals(id) ON DELETE CASCADE,
    lgd_code VARCHAR(20) UNIQUE,
    population INTEGER,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (name, mandal_id)
);
CREATE INDEX idx_villages_name ON villages(name);
CREATE INDEX idx_villages_mandal ON villages(mandal_id);

-- Exactly one of village_id / mandal_id / district_id is populated,
-- matching the user's role (citizen & panchayat -> village_id,
-- tahsildar -> mandal_id, collector -> district_id).
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role role_enum NOT NULL DEFAULT 'citizen',
    village_id INTEGER REFERENCES villages(id),
    mandal_id INTEGER REFERENCES mandals(id),
    district_id INTEGER REFERENCES districts(id),
    must_reset_password BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE officials (
    id SERIAL PRIMARY KEY,
    village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150)
);

CREATE TABLE water_records (
    id SERIAL PRIMARY KEY,
    village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    households_covered INTEGER,
    households_total INTEGER,
    source_type VARCHAR(100),
    quality_index DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE education_records (
    id SERIAL PRIMARY KEY,
    village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    schools_count INTEGER,
    enrollment_rate DOUBLE PRECISION,
    dropout_rate DOUBLE PRECISION,
    teacher_student_ratio DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE health_records (
    id SERIAL PRIMARY KEY,
    village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    phc_distance_km DOUBLE PRECISION,
    immunization_rate DOUBLE PRECISION,
    maternal_mortality_flag INTEGER,
    malnutrition_rate DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE crop_records (
    id SERIAL PRIMARY KEY,
    village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    primary_crop VARCHAR(100),
    irrigation_coverage DOUBLE PRECISION,
    avg_yield_per_acre DOUBLE PRECISION,
    rainfall_deviation_pct DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE grievances (
    id SERIAL PRIMARY KEY,
    village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    filed_by_user_id INTEGER REFERENCES users(id),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    escalated_to_collector INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    domain VARCHAR(100) NOT NULL,
    financial_year VARCHAR(20) NOT NULL,
    allocated_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    utilized_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    scheme_name VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT now()
);
