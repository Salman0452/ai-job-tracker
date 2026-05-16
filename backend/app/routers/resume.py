import os
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_db, get_current_user
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ResumeOut, ResumeDetailOut
from app.services.resume_service import extract_text_from_pdf

router = APIRouter(prefix="/resume", tags=["resume"])
UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=ResumeOut, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    file_bytes = await file.read()

    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 5MB")

    content_text = extract_text_from_pdf(file_bytes)

    if not content_text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF. Ensure it is not scanned.")

    file_path = f"{UPLOAD_DIR}/{current_user.id}_{file.filename}"
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_bytes)

    # Check if this is user's first resume — auto set as primary
    result = await db.execute(select(Resume).where(Resume.user_id == current_user.id))
    existing = result.scalars().all()
    is_primary = len(existing) == 0

    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        content_text=content_text,
        is_primary=is_primary
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume


@router.get("/", response_model=list[ResumeOut])
async def list_resumes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Resume).where(Resume.user_id == current_user.id).order_by(Resume.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{resume_id}", response_model=ResumeDetailOut)
async def get_resume(
    resume_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.patch("/{resume_id}/primary", response_model=ResumeOut)
async def set_primary(
    resume_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Unset all primaries for this user
    result = await db.execute(
        select(Resume).where(Resume.user_id == current_user.id)
    )
    all_resumes = result.scalars().all()

    target = None
    for r in all_resumes:
        if r.id == resume_id:
            target = r
        r.is_primary = False

    if not target:
        raise HTTPException(status_code=404, detail="Resume not found")

    target.is_primary = True
    await db.commit()
    await db.refresh(target)
    return target


@router.delete("/{resume_id}", status_code=204)
async def delete_resume(
    resume_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user.id)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if resume.is_primary:
        raise HTTPException(status_code=400, detail="Cannot delete primary resume. Set another as primary first.")

    # Delete file from disk
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)

    await db.delete(resume)
    await db.commit()