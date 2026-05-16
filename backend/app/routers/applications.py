from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.dependencies import get_db, get_current_user
from app.models.application import Application, ApplicationStatus
from app.models.resume import Resume
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationOut, ApplicationDetailOut

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("/", response_model=ApplicationDetailOut, status_code=201)
async def create_application(
    data: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate resume belongs to user if provided
    if data.resume_id:
        result = await db.execute(
            select(Resume).where(Resume.id == data.resume_id, Resume.user_id == current_user.id)
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Resume not found")

    # If no resume provided, auto-attach primary resume
    resume_id = data.resume_id
    if not resume_id:
        result = await db.execute(
            select(Resume).where(Resume.user_id == current_user.id, Resume.is_primary == True)
        )
        primary = result.scalar_one_or_none()
        if primary:
            resume_id = primary.id

    application = Application(
        user_id=current_user.id,
        resume_id=resume_id,
        company_name=data.company_name,
        job_title=data.job_title,
        job_description=data.job_description,
        job_url=data.job_url,
        applied_date=data.applied_date,
        notes=data.notes
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


@router.get("/", response_model=list[ApplicationOut])
async def list_applications(
    status: Optional[ApplicationStatus] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Application).where(Application.user_id == current_user.id)

    if status:
        query = query.where(Application.status == status)

    if search:
        search_term = f"%{search.lower()}%"
        query = query.where(
            Application.company_name.ilike(search_term) |
            Application.job_title.ilike(search_term)
        )

    query = query.order_by(Application.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{app_id}", response_model=ApplicationDetailOut)
async def get_application(
    app_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == current_user.id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.patch("/{app_id}", response_model=ApplicationDetailOut)
async def update_application(
    app_id: int,
    data: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == current_user.id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if data.resume_id:
        res = await db.execute(
            select(Resume).where(Resume.id == data.resume_id, Resume.user_id == current_user.id)
        )
        if not res.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Resume not found")

    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(application, key, val)

    await db.commit()
    await db.refresh(application)
    return application


@router.delete("/{app_id}", status_code=204)
async def delete_application(
    app_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Application).where(Application.id == app_id, Application.user_id == current_user.id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    await db.delete(application)
    await db.commit()