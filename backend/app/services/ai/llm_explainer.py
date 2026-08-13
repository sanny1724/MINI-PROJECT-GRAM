"""
Major-project stage: LLM-based natural-language explanation and recommendation
engine. Takes a VillageRiskSummary and produces plain-language explanations
for citizens and prioritized action recommendations for officials, via
Gemini/OpenAI API. Not yet implemented — mini-project uses the short
rule-based `explanation` strings from risk_engine.py directly.
"""


def explain_village_risk(village_risk_summary: dict) -> str:
    raise NotImplementedError("LLM explanation layer is planned for the major-project phase.")


def recommend_actions(village_risk_summary: dict) -> list[str]:
    raise NotImplementedError("LLM recommendation layer is planned for the major-project phase.")
