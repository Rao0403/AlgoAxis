# AlgoAxis

AlgoAxis is a structured training platform for technical interview preparation that sits on top of platforms like LeetCode.

## Product Overview
AlgoAxis focuses on building durable interview habits rather than short bursts of practice:
- Consistency over grinding
- Guided reasoning over memorization
- Social accountability over isolated practice

LeetCode is the content source. AlgoAxis is the training and discipline layer built around that content.

## Core Features (v1)
- Problem Tracker with Notes
  - Track solved problems with difficulty, topic, points, summary, and notes. (Implemented)
  - Statuses: To-Do, In Progress, Solved, Revisit. (Planned)
  - Search, filter, and sort. (Planned)
- LeetCode Profile Sync (Browser Extension)
  - One-time username setup, pulls problem metadata from public profiles. (Planned)
  - Periodic sync to reduce manual tracking. (Planned)
- Dashboard and Leaderboards
  - Problems solved and points summary, difficulty and topic distribution, and points over time. (Implemented)
  - Global leaderboard. (Implemented)
  - Streaks and group-specific leaderboards. (Planned)
- AI Guided Problem Solver
  - LLM used as a thinking guide, not an answer generator. (Implemented)
  - Explains problems in simple terms and offers progressive hints.
  - Responds to partial user thoughts and reveals a full solution only at the end.
- Groups (Clans)
  - Create or join up to 2 groups, with invite codes and member lists. (Implemented)
  - Internal leaderboards and shared progress. (Planned)
- Private Programming Contests
  - Group admins create time-bound contests with 3 to 5 problems. (Planned)
  - Scoring based on difficulty, time, and penalties. (Planned)
  - Group-specific contest leaderboards. (Planned)
- Code Execution (v1)
  - In-browser editor, run code against test cases, verdicts, submission tracking. (Planned)

## Other Implemented Modules
- AI problem recommendations based on a user's solved history.
- Resume upload and AI resume analysis (stored in S3, analyzed via Gemini).

## Architecture Overview
High level flow:
- Browser
  - Next.js frontend (pages, charts, UI)
  - Calls relative `/api/*` routes
- Next.js rewrites
  - Proxies `/api/*` to AWS Elastic Beanstalk backend
  - Backend URL is not exposed to the browser
- Flask backend
  - REST API in `backend/app.py`
  - MySQL via PyMySQL
  - AWS S3 for resume storage
  - Gemini (google-generativeai) for AI features

## Repository Structure
- `backend/` - Flask API, database schema, and Python dependencies
  - `backend/app.py` - API routes and core services
  - `backend/db_setup.sql` - MySQL schema
  - `backend/requirements.txt` - Python dependencies
  - `backend/.env` - Local dev environment variables (do not commit real secrets)
- `frontend/` - Next.js app
  - `frontend/pages/` - Routes and pages
  - `frontend/components/` - Shared UI components
  - `frontend/styles/` - Global styles
  - `frontend/utils/` - API helper
  - `frontend/next.config.js` - API proxy rewrites
  - `frontend/package.json` - Frontend scripts and dependencies

## Local Development Setup

### Prerequisites
- Node.js and npm
- (Optional for backend) Python 3 and MySQL

### Frontend
1) Install dependencies:
```bash
cd frontend
npm install
```

2) Run the dev server:
```bash
npm run dev
```

3) Why no `NEXT_PUBLIC_API_URL` is needed:
- Frontend calls relative `/api/*` endpoints.
- `frontend/next.config.js` rewrites those requests to the Elastic Beanstalk backend.
- The backend URL never reaches the browser.

4) Verify API proxy is working:
- Open `http://localhost:3000/api/health`
- You should see a JSON response like `{ "status": "healthy", ... }`

### Backend (optional local run)
1) Create the MySQL database and tables:
```bash
mysql -u <user> -p < backend/db_setup.sql
```

2) Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3) Set environment variables (see list below), then run:
```bash
python app.py
```

### Backend Environment Variables
Defined in `backend/app.py`:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`
- `GEMINI_API_KEY`

## Deployment

### Frontend
- Standard Next.js deployment:
```bash
cd frontend
npm run build
npm run start
```
- API proxy rewrites are configured in `frontend/next.config.js`. Update the `destination` for staging or production as needed.

### Backend
- Deploy the Flask app in `backend/` to AWS Elastic Beanstalk.
- Set the environment variables in the Elastic Beanstalk environment.
- Ensure the database and S3 bucket are reachable from the EB environment.

## Authentication and Security
- Auth endpoints: `POST /api/register` and `POST /api/login`.
- Passwords are hashed using Werkzeug.
- The frontend stores `user_id` (and optionally name/email) in `localStorage` and gates routes client-side.
- No token-based auth, refresh tokens, or server-side sessions are implemented yet. (Planned)
- Rate limiting is not implemented. (Planned)

## Payments (Stripe)
- Not implemented. (Planned)

## Roadmap / Next Steps
- UI polish and consistency improvements
- Contest system with judging and leaderboards
- Deeper analytics (streaks, cohort tracking, topic mastery)
- Auth hardening (sessions or JWT, server-side checks, rate limiting)
- Performance and scaling improvements

## Contributing
- Create a feature branch and open a PR.
- Run linting before submitting:
```bash
cd frontend
npm run lint
```
- No automated test suite is defined yet.

## License
- To be defined.
