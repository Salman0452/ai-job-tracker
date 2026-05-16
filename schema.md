users
─────
id                  PK
email               UNIQUE NOT NULL
username            NOT NULL
hashed_password     NOT NULL
role                ENUM(user, admin) DEFAULT user
is_active           BOOLEAN DEFAULT true
created_at          TIMESTAMP
updated_at          TIMESTAMP

resumes
───────
id                  PK
user_id             FK → users.id
filename            NOT NULL
content_text        TEXT (extracted plain text)
is_primary          BOOLEAN DEFAULT false
created_at          TIMESTAMP

applications
────────────
id                  PK
user_id             FK → users.id
resume_id           FK → resumes.id (which resume was used)
company_name        NOT NULL
job_title           NOT NULL
job_description     TEXT NOT NULL
job_url             VARCHAR (optional)
status              ENUM(saved, applied, interview, offer, rejected)
applied_date        DATE (nullable)
notes               TEXT (nullable)
created_at          TIMESTAMP
updated_at          TIMESTAMP

ai_results
──────────
id                  PK
application_id      FK → applications.id UNIQUE
jd_analysis         JSONB  (extracted skills, seniority, culture)
match_score         INTEGER (0-100)
match_breakdown     JSONB  (matched skills, missing skills, detail)
cover_letter        TEXT
skill_gaps          JSONB  (list of gaps + learning recommendations)
processing_status   ENUM(pending, processing, completed, failed)
created_at          TIMESTAMP
updated_at          TIMESTAMP

admin_logs
──────────
id                  PK
admin_id            FK → users.id
action              VARCHAR (e.g. "deactivated_user", "viewed_stats")
target_user_id      FK → users.id (nullable)
metadata            JSONB
created_at          TIMESTAMP

refresh_tokens
──────────────
id          PK
user_id     FK → users.id
token       VARCHAR (hashed, unique)
expires_at  TIMESTAMP
is_revoked  BOOLEAN DEFAULT false
created_at  TIMESTAMP

email_verifications
───────────────────
id          PK
user_id     FK → users.id
code_hash   VARCHAR  (store hashed OTP, never plain)
expires_at  TIMESTAMP (10 minutes from creation)
is_used     BOOLEAN DEFAULT false
created_at  TIMESTAMP

is_email_verified  BOOLEAN DEFAULT false