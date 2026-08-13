"""
Rule-based risk classification engine for GRAM (mini-project baseline).

Each domain function takes the latest record for a village and returns a
DomainRisk (0-100 score, level, and a short human-readable explanation).

This is intentionally simple (weighted rule-based logic) so it can run
without external ML dependencies. The major-project phase upgrades these
into trained models (see services/ai/forecasting.py, clustering.py,
llm_explainer.py placeholders below) while keeping the same output shape,
so the API and frontend don't need to change.
"""
from app.schemas.domains import DomainRisk


def _level(score: float) -> str:
    if score >= 75:
        return "Critical"
    if score >= 50:
        return "High"
    if score >= 25:
        return "Medium"
    return "Low"


def water_risk(record) -> DomainRisk:
    if record is None:
        return DomainRisk(domain="water", risk_score=50, risk_level="Medium",
                           explanation="No water data reported yet for this village.")
    coverage = 0.0
    if record.households_total:
        coverage = (record.households_covered or 0) / record.households_total * 100
    quality = record.quality_index if record.quality_index is not None else 50

    score = (100 - coverage) * 0.6 + (100 - quality) * 0.4
    score = max(0, min(100, score))
    explanation = f"{coverage:.0f}% household coverage, water quality index {quality:.0f}/100."
    return DomainRisk(domain="water", risk_score=round(score, 1), risk_level=_level(score), explanation=explanation)


def education_risk(record) -> DomainRisk:
    if record is None:
        return DomainRisk(domain="education", risk_score=50, risk_level="Medium",
                           explanation="No education data reported yet for this village.")
    enrollment = record.enrollment_rate if record.enrollment_rate is not None else 70
    dropout = record.dropout_rate if record.dropout_rate is not None else 15
    ratio = record.teacher_student_ratio if record.teacher_student_ratio is not None else 30

    ratio_penalty = max(0, (ratio - 25)) * 1.5  # penalize ratios worse than 1:25
    score = (100 - enrollment) * 0.4 + dropout * 1.2 + min(ratio_penalty, 30)
    score = max(0, min(100, score))
    explanation = f"Enrollment {enrollment:.0f}%, dropout {dropout:.0f}%, teacher-student ratio 1:{ratio:.0f}."
    return DomainRisk(domain="education", risk_score=round(score, 1), risk_level=_level(score), explanation=explanation)


def health_risk(record) -> DomainRisk:
    if record is None:
        return DomainRisk(domain="health", risk_score=50, risk_level="Medium",
                           explanation="No health data reported yet for this village.")
    distance = record.phc_distance_km if record.phc_distance_km is not None else 10
    immunization = record.immunization_rate if record.immunization_rate is not None else 70
    malnutrition = record.malnutrition_rate if record.malnutrition_rate is not None else 15
    mortality_flags = record.maternal_mortality_flag or 0

    score = (min(distance, 30) / 30) * 25 + (100 - immunization) * 0.35 + malnutrition * 0.9 + mortality_flags * 10
    score = max(0, min(100, score))
    explanation = (f"PHC {distance:.0f} km away, immunization {immunization:.0f}%, "
                   f"malnutrition rate {malnutrition:.0f}%.")
    return DomainRisk(domain="health", risk_score=round(score, 1), risk_level=_level(score), explanation=explanation)


def crop_risk(record) -> DomainRisk:
    if record is None:
        return DomainRisk(domain="crop", risk_score=50, risk_level="Medium",
                           explanation="No crop/agriculture data reported yet for this village.")
    irrigation = record.irrigation_coverage if record.irrigation_coverage is not None else 50
    rainfall_dev = abs(record.rainfall_deviation_pct) if record.rainfall_deviation_pct is not None else 10

    score = (100 - irrigation) * 0.6 + min(rainfall_dev, 60) * 0.7
    score = max(0, min(100, score))
    explanation = f"Irrigation coverage {irrigation:.0f}%, rainfall deviation {rainfall_dev:.0f}% from normal."
    return DomainRisk(domain="crop", risk_score=round(score, 1), risk_level=_level(score), explanation=explanation)


def governance_risk(open_grievances: int, escalated_grievances: int, total_grievances: int) -> DomainRisk:
    if total_grievances == 0:
        return DomainRisk(domain="governance", risk_score=10, risk_level="Low",
                           explanation="No grievances filed for this village yet.")
    open_ratio = open_grievances / total_grievances * 100
    escalation_ratio = escalated_grievances / total_grievances * 100

    score = open_ratio * 0.5 + escalation_ratio * 0.5
    score = max(0, min(100, score))
    explanation = (f"{open_grievances}/{total_grievances} grievances still open, "
                    f"{escalated_grievances} escalated to collector.")
    return DomainRisk(domain="governance", risk_score=round(score, 1), risk_level=_level(score), explanation=explanation)


def overall_risk(domain_risks: list[DomainRisk]) -> tuple[float, str]:
    if not domain_risks:
        return 0.0, "Low"
    avg = sum(d.risk_score for d in domain_risks) / len(domain_risks)
    return round(avg, 1), _level(avg)
