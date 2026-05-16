PAGES
─────
/                           Landing page (hero, features, CTA)
/login                      Login form
/register                   Register form
/dashboard                  Stats cards + recent applications 
/applications               Full list with filters + kanban toggle
/applications/new           Multi-step form (paste JD → select resume → submit)
/applications/[id]          Detail view (JD, AI results, cover letter, notes)
/resume                     Upload + manage resumes, set primary
/analytics                  Charts: pipeline funnel, skill demand, timeline
/admin                      Admin layout wrapper
/admin/dashboard            System stats (total users, apps, AI calls)
/admin/users                User table (activate/deactivate)
/admin/logs                 Admin action log

SHARED COMPONENTS
─────────────────
Navbar (user nav + admin nav — different based on role)
Sidebar (dashboard layout)
StatusBadge (color-coded application status)
AIResultCard (match score ring, skill chips, cover letter)
SkillGapCard (gap + recommendation)
ApplicationKanban (drag status columns)
AnalyticsChart (Recharts wrappers)
DataTable (reusable admin table)