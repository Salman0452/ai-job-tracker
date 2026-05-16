POST /ai/analyze/{app_id}
        │
        ▼
Background Task starts
        │
        ├─► Step 1: JD Analysis
        │   Prompt: Extract required skills (list), nice-to-have skills,
        │           seniority level, company culture signals
        │   Output: JSON stored in ai_results.jd_analysis
        │
        ├─► Step 2: Resume Scoring
        │   Input: resume content_text + jd_analysis output
        │   Prompt: Score match 0-100, list matched skills,
        │           list missing required skills, explain score
        │   Output: JSON stored in ai_results.match_score + match_breakdown
        │
        ├─► Step 3: Skill Gap Analysis
        │   Input: missing skills from Step 2
        │   Prompt: For each gap, recommend specific resource
        │           (course, concept to learn, estimated time)
        │   Output: JSON stored in ai_results.skill_gaps
        │
        └─► Step 4: Cover Letter Generation
            Input: jd_analysis + resume text + match_breakdown
            Prompt: Write professional cover letter tailored to
                    this specific JD, highlight matched skills,
                    address gaps confidently
            Output: Text stored in ai_results.cover_letter

Each step updates processing_status.
Frontend polls GET /ai/results/{app_id} every 3 seconds until status = completed.