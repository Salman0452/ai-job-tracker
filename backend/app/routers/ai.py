from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_db, get_current_user
from app.models.application import Application
from app.models.ai_result import AIResult, ProcessingStatus
from app.models.resume import Resume
from app.models.user import User
from app.schemas.ai_result import AIResultOut, AITriggerResponse
from app.services.ai_service import (
    analyze_job_description,
    score_resume,
    analyze_skill_gaps,
    generate_cover_letter
)

router = APIRouter(prefix="/ai", tags=["ai"])


async def run_ai_pipeline(application_id: int):
    from app.core.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        # Fetch application
        result = await db.execute(select(Application).where(Application.id == application_id))
        application = result.scalar_one_or_none()
        if not application:
            return

        # Fetch or create ai_result row
        res = await db.execute(select(AIResult).where(AIResult.application_id == application_id))
        ai_result = res.scalar_one_or_none()
        if not ai_result:
            ai_result = AIResult(application_id=application_id)
            db.add(ai_result)
            await db.commit()
            await db.refresh(ai_result)

        # Mark as processing
        ai_result.processing_status = ProcessingStatus.processing
        await db.commit()

        try:
            # Fetch resume text
            resume_text = ""
            if application.resume_id:
                res = await db.execute(select(Resume).where(Resume.id == application.resume_id))
                resume = res.scalar_one_or_none()
                if resume and resume.content_text:
                    resume_text = resume.content_text

            # Step 1 — JD Analysis
            jd_analysis = analyze_job_description(application.job_description)
            ai_result.jd_analysis = jd_analysis
            await db.commit()

            # Step 2 — Resume Scoring
            match_breakdown = score_resume(resume_text, jd_analysis)
            ai_result.match_score = match_breakdown.get("match_score", 0)
            ai_result.match_breakdown = match_breakdown
            await db.commit()

            # Step 3 — Skill Gap Analysis
            missing = match_breakdown.get("missing_required_skills", [])
            skill_gaps = analyze_skill_gaps(missing)
            ai_result.skill_gaps = skill_gaps
            await db.commit()

            # Step 4 — Cover Letter
            cover_letter = generate_cover_letter(
                resume_text=resume_text,
                jd_analysis=jd_analysis,
                match_breakdown=match_breakdown,
                company_name=application.company_name,
                job_title=application.job_title
            )
            ai_result.cover_letter = cover_letter
            ai_result.processing_status = ProcessingStatus.completed
            await db.commit()

        except Exception as e:
            ai_result.processing_status = ProcessingStatus.failed
            await db.commit()
            print(f"[AI PIPELINE ERROR] application_id={application_id}: {e}")


@router.post("/analyze/{app_id}", response_model=AITriggerResponse)
async def trigger_analysis(
    app_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == current_user.id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if not application.resume_id:
        raise HTTPException(status_code=400, detail="No resume attached to this application")

    # Check if already processing
    res = await db.execute(select(AIResult).where(AIResult.application_id == app_id))
    existing = res.scalar_one_or_none()
    if existing and existing.processing_status == ProcessingStatus.processing:
        raise HTTPException(status_code=400, detail="Analysis already in progress")

    background_tasks.add_task(run_ai_pipeline, app_id)
    return {"message": "Analysis started", "application_id": app_id}


@router.get("/results/{app_id}", response_model=AIResultOut)
async def get_results(
    app_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify ownership
    res = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == current_user.id)
    )
    if not res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Application not found")

    result = await db.execute(select(AIResult).where(AIResult.application_id == app_id))
    ai_result = result.scalar_one_or_none()
    if not ai_result:
        raise HTTPException(status_code=404, detail="No analysis found. Trigger analysis first.")

    return ai_result