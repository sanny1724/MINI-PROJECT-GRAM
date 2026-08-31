# GRAM Backend API & Governance Risk Engine

FastAPI backend providing real-time data feeds, AI predictive risk scoring, and administrative audit trails for the Telangana GRAM Governance Portal.

## Architecture
- **Framework**: FastAPI with Uvicorn ASGI server
- **Database**: PostgreSQL / SQLite with SQLAlchemy ORM
- **AI Engine**: Statistical regression and time-series clustering for infrastructure delay forecasting
- **LGD Directory**: Multi-tier hierarchy supporting State, District, Mandal, and Village administrative scopes

## Endpoints Overview
- GET /api/villages/{id}/dashboard: Live composite development score, domain breakdown, and public budgets.
- GET /api/geo/districts: Complete district and mandal cadastral registry.
- POST /api/grievances: Public citizen issue filing with GPS & photo evidence support.
- GET /api/dashboard/risk-summary: Aggregated collector-level risk alerts and priority heatmaps.
