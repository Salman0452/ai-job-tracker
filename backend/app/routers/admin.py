from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.dependencies import get_db, require_admin
from app.models.user import User
from app.models.application import Application
from app.models.ai_result import AIResult, ProcessingStatus
from app.models.admin_log import AdminLog
from app.schemas.admin import AdminUserOut, AdminUserUpdate, AdminStats, AdminLogOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[AdminUserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin)
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()

    # Attach application count per user
    counts_result = await db.execute(
        select(Application.user_id, func.count().label("total"))
        .group_by(Application.user_id)
    )
    counts = {row.user_id: row.total for row in counts_result.all()}

    output = []
    for user in users:
        user_dict = AdminUserOut.model_validate(user)
        user_dict.total_applications = counts.get(user.id, 0)
        output.append(user_dict)

    return output


@router.patch("/users/{user_id}", response_model=AdminUserOut)
async def update_user_status(
    user_id: int,
    data: AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")

    user.is_active = data.is_active
    await db.commit()
    await db.refresh(user)

    # Log the action
    log = AdminLog(
        admin_id=admin.id,
        action="activated_user" if data.is_active else "deactivated_user",
        target_user_id=user.id,
        metadata_={"email": user.email, "is_active": data.is_active}
    )
    db.add(log)
    await db.commit()

    return AdminUserOut.model_validate(user)


@router.get("/stats", response_model=AdminStats)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin)
):
    total_users = await db.execute(select(func.count()).select_from(User))
    active_users = await db.execute(
        select(func.count()).select_from(User).where(User.is_active == True)
    )
    total_apps = await db.execute(select(func.count()).select_from(Application))
    total_ai = await db.execute(
        select(func.count()).select_from(AIResult)
        .where(AIResult.processing_status == ProcessingStatus.completed)
    )

    return AdminStats(
        total_users=total_users.scalar() or 0,
        active_users=active_users.scalar() or 0,
        total_applications=total_apps.scalar() or 0,
        total_ai_analyses=total_ai.scalar() or 0
    )


@router.get("/logs", response_model=list[AdminLogOut])
async def get_logs(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin)
):
    result = await db.execute(
        select(AdminLog).order_by(AdminLog.created_at.desc()).limit(100)
    )
    return result.scalars().all()