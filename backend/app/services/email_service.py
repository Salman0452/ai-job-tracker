import httpx
from app.core.config import settings

MAILTRAP_URL = "https://send.api.mailtrap.io/api/send"

async def send_otp_email(to_email: str, username: str, otp: str):
    if not settings.MAILTRAP_TOKEN:
        # Dev fallback — just print to console
        print(f"[EMAIL] OTP for {to_email}: {otp}")
        return

    payload = {
        "from": {"email": "noreply@aijobtracker.dev", "name": "AI Job Tracker"},
        "to": [{"email": to_email}],
        "subject": "Verify your email — AI Job Tracker",
        "text": f"Hi {username},\n\nYour verification code is: {otp}\n\nThis code expires in 10 minutes.\n\nIf you did not create an account, ignore this email.",
        "html": f"""
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0f172a;color:#f1f5f9;border-radius:12px">
            <h2 style="color:#60a5fa;margin-bottom:8px">Verify your email</h2>
            <p style="color:#94a3b8">Hi {username}, enter this code to verify your account:</p>
            <div style="background:#1e293b;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
                <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#f1f5f9">{otp}</span>
            </div>
            <p style="color:#64748b;font-size:13px">Expires in 10 minutes. If you did not create an account, ignore this email.</p>
        </div>
        """
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            MAILTRAP_URL,
            json=payload,
            headers={"Authorization": f"Bearer {settings.MAILTRAP_TOKEN}"}
        )
        if response.status_code not in (200, 201):
            error_msg = f"Mailtrap API error {response.status_code}: {response.text}"
            print(f"[EMAIL ERROR] {error_msg}")
            raise Exception(error_msg)