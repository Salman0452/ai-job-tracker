from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, String
from collections import Counter
from app.dependencies import get_db, get_current_user
from app.models.application import Application, ApplicationStatus
from app.models.ai_result import AIResult, ProcessingStatus
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsSummary, StatusCount,
    SkillsAnalytics, SkillDemand,
    TimelineAnalytics, TimelinePoint
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total applications
    total_result = await db.execute(
        select(func.count()).where(Application.user_id == current_user.id)
        .select_from(Application)
    )
    total = total_result.scalar() or 0

    # By status
    status_result = await db.execute(
        select(Application.status, func.count().label("count"))
        .where(Application.user_id == current_user.id)
        .group_by(Application.status)
    )
    by_status = [
        StatusCount(status=row.status.value, count=row.count)
        for row in status_result.all()
    ]

    # Average match score
    score_result = await db.execute(
        select(func.avg(AIResult.match_score))
        .join(Application, AIResult.application_id == Application.id)
        .where(
            Application.user_id == current_user.id,
            AIResult.processing_status == ProcessingStatus.completed,
            AIResult.match_score.isnot(None)
        )
    )
    avg_score = score_result.scalar() or 0.0

    # Total completed analyses
    analyses_result = await db.execute(
        select(func.count())
        .select_from(AIResult)
        .join(Application, AIResult.application_id == Application.id)
        .where(
            Application.user_id == current_user.id,
            AIResult.processing_status == ProcessingStatus.completed
        )
    )
    total_analyses = analyses_result.scalar() or 0

    return AnalyticsSummary(
        total_applications=total,
        by_status=by_status,
        average_match_score=round(float(avg_score), 1),
        total_ai_analyses=total_analyses
    )


@router.get("/skills", response_model=SkillsAnalytics)
async def get_skill_demand(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Pull all jd_analysis JSONB for this user's completed analyses
    result = await db.execute(
        select(AIResult.jd_analysis)
        .join(Application, AIResult.application_id == Application.id)
        .where(
            Application.user_id == current_user.id,
            AIResult.processing_status == ProcessingStatus.completed,
            AIResult.jd_analysis.isnot(None)
        )
    )
    rows = result.scalars().all()

    # Count skill frequency across all JDs
    skill_counter: Counter = Counter()
    for jd_analysis in rows:
        if isinstance(jd_analysis, dict):
            required = jd_analysis.get("required_skills", [])
            nice = jd_analysis.get("nice_to_have_skills", [])
            for skill in required + nice:
                skill_counter[skill.lower().strip()] += 1

    top_skills = [
        SkillDemand(skill=skill, count=count)
        for skill, count in skill_counter.most_common(20)
    ]

    return SkillsAnalytics(top_skills=top_skills)


@router.get("/timeline", response_model=TimelineAnalytics)
async def get_timeline(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(
            func.to_char(Application.created_at, 'IYYY-IW').label("week"),
            func.count().label("count")
        )
        .where(Application.user_id == current_user.id)
        .group_by("week")
        .order_by("week")
    )
    rows = result.all()

    timeline = [TimelinePoint(week=row.week, count=row.count) for row in rows]
    return TimelineAnalytics(timeline=timeline)