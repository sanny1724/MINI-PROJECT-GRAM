"""
Major-project stage: time-series forecasting (e.g. water demand, crop yield trends).

Planned approach: use historical WaterRecord / CropRecord snapshots per village
(requires periodic data ingestion) with a lightweight model such as
statsmodels ETS/ARIMA or Prophet. Not yet implemented — mini-project uses
rule-based risk_engine.py only.
"""


def forecast_metric(village_id: int, domain: str, periods: int = 3):
    raise NotImplementedError("Forecasting is planned for the major-project phase.")
