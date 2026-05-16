import json
from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"


def _chat(system: str, user: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        temperature=0.3,
        max_tokens=2000
    )
    return response.choices[0].message.content.strip()


def _parse_json(raw: str) -> dict:
    # Strip markdown fences if model wraps output
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        cleaned = cleaned.rsplit("```", 1)[0]
    return json.loads(cleaned.strip())


def analyze_job_description(jd: str) -> dict:
    system = """You are an expert technical recruiter.
Analyze the job description and return ONLY valid JSON with this exact structure:
{
  "required_skills": ["skill1", "skill2"],
  "nice_to_have_skills": ["skill1", "skill2"],
  "seniority_level": "junior|mid|senior|lead",
  "employment_type": "full-time|part-time|contract|unknown",
  "company_culture": ["culture_signal1", "culture_signal2"],
  "key_responsibilities": ["responsibility1", "responsibility2"],
  "summary": "2-3 sentence summary of the role"
}
Return only JSON. No explanation. No markdown."""

    raw = _chat(system, f"Analyze this job description:\n\n{jd}")
    return _parse_json(raw)


def score_resume(resume_text: str, jd_analysis: dict) -> dict:
    system = """You are an expert ATS resume scorer.
Given a resume and job analysis, return ONLY valid JSON with this exact structure:
{
  "match_score": 75,
  "matched_skills": ["skill1", "skill2"],
  "missing_required_skills": ["skill1", "skill2"],
  "missing_nice_to_have": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "score_explanation": "2-3 sentence explanation of the score"
}
match_score must be an integer between 0 and 100.
Return only JSON. No explanation. No markdown."""

    user = f"""Resume:
{resume_text}

Job Analysis:
{json.dumps(jd_analysis, indent=2)}

Score this resume against the job."""

    raw = _chat(system, user)
    return _parse_json(raw)


def analyze_skill_gaps(missing_skills: list[str]) -> dict:
    if not missing_skills:
        return {"gaps": []}

    system = """You are a senior engineering career coach.
Given a list of missing skills, return ONLY valid JSON with this exact structure:
{
  "gaps": [
    {
      "skill": "skill_name",
      "importance": "critical|important|nice_to_have",
      "learning_resource": "Specific course, book, or project recommendation",
      "estimated_time": "e.g. 2 weeks, 1 month"
    }
  ]
}
Return only JSON. No explanation. No markdown."""

    raw = _chat(system, f"Provide learning recommendations for these missing skills:\n{json.dumps(missing_skills)}")
    return _parse_json(raw)


def generate_cover_letter(
    resume_text: str,
    jd_analysis: dict,
    match_breakdown: dict,
    company_name: str,
    job_title: str
) -> str:
    system = """You are an expert career coach who writes compelling, personalized cover letters.
Write a professional cover letter that:
- Opens with a strong hook, not "I am applying for"
- Highlights matched skills naturally
- Addresses experience confidently without mentioning gaps
- Is 3-4 paragraphs, under 400 words
- Ends with a clear call to action
Return only the cover letter text. No subject line. No markdown."""

    user = f"""Write a cover letter for this candidate applying to {company_name} for the {job_title} role.

Resume:
{resume_text}

Job Requirements:
{json.dumps(jd_analysis, indent=2)}

Candidate Strengths:
{json.dumps(match_breakdown.get('strengths', []))}

Matched Skills:
{json.dumps(match_breakdown.get('matched_skills', []))}"""

    return _chat(system, user)