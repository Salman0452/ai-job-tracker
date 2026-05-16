AUTH
POST   /auth/register          → create user
POST   /auth/login             → returns JWT
GET    /auth/me                → current user info

RESUME
POST   /resume/upload          → upload + extract text, save to DB
GET    /resume/                → list user's resumes
DELETE /resume/{id}            → delete resume
PATCH  /resume/{id}/primary    → set as primary resume

APPLICATIONS
POST   /applications/          → create application (JD + metadata)
GET    /applications/          → list with filters (status, search)
GET    /applications/{id}      → single application with ai_results
PATCH  /applications/{id}      → update status, notes
DELETE /applications/{id}      → delete

AI
POST   /ai/analyze/{app_id}    → trigger full AI analysis (background task)
GET    /ai/results/{app_id}    → get ai_results for application

ANALYTICS
GET    /analytics/summary      → total apps, by status counts, avg match score
GET    /analytics/skills       → top skills in demand across all JDs
GET    /analytics/timeline     → applications over time (weekly)

ADMIN
GET    /admin/users            → list all users + stats
PATCH  /admin/users/{id}       → activate/deactivate user
GET    /admin/stats            → system-wide stats
GET    /admin/logs             → admin action log