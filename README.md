# Intern Connect Backend

This is the backend service for the Intern Connect platform, built with NestJS and PostgreSQL.

## Prerequisites

- Node.js (v20 or higher)
- Docker and Docker Compose
- npm (usually comes with Node.js)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/hugovasko/intern-com-frontend.git
cd intern-com-backend
```

2. Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3030
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=internships_db
JWT_SECRET=your-super-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000
```

3. Start PostgreSQL using Docker:

```bash
docker-compose up --build -d
```

4. Install dependencies:

```bash
npm install
```

5. Start the development server:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3030`.

## Database Seeding

To populate the database with sample data, run:

```bash
npm run seed
```

This will create:

- 5 candidate users with realistic Bulgarian names
- 5 major Bulgarian tech companies with their representatives
- Multiple job opportunities per company (2-3 full-time positions and 1-2 internships)
- 2 admin users

### Sample Users

#### Admins:

1. admin1@example.com / 123456
2. admin2@example.com / 123456

#### Partners (Companies):

1. Chaos Group (careers@chaosgroup.com / 123456)
2. Progress (careers@progress.com / 123456)
3. Telerik Academy (careers@telerikacademy.com / 123456)
4. SoftUni (careers@softuni.bg / 123456)
5. ScaleFocus (careers@scalefocus.com / 123456)

#### Candidates:

1. ivan.dimitrov@example.com / 123456
2. maria.petrova@example.com / 123456
3. georgi.ivanov@example.com / 123456
4. elena.todorova@example.com / 123456
5. stefan.angelov@example.com / 123456

### Sample Job Types

#### Full-time Positions:

- Senior Software Engineer
- Frontend Developer
- DevOps Engineer

#### Internships:

- Junior Developer Intern
- QA Engineering Intern
- UI/UX Design Intern

All positions include detailed descriptions, requirements, and realistic salary ranges:

- Internships: 800-1300 BGN
- Full-time positions: 3000-5000 BGN

## API Documentation

### Authentication Endpoints

`POST /auth/register`

- Register a new user
- Body:

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string"
}
```

`POST /auth/login`

- Login
- Body:

```json
{
  "email": "string",
  "password": "string"
}
```

### Opportunities Endpoints

`GET /opportunities`

- Get all opportunities
- Public endpoint

`GET /opportunities/:id`

- Get specific opportunity
- Public endpoint

`POST /opportunities`

- Create new opportunity
- Protected endpoint (Partner only)
- Body:

```json
{
  "title": "string",
  "description": "string",
  "location": "string",
  "type": "internship" | "full-time",
  "salary": "number" (optional)
}
```

`PATCH /opportunities/:id`

- Update opportunity
- Protected endpoint (Partner owner or Admin)

`DELETE /opportunities/:id`

- Delete opportunity
- Protected endpoint (Partner owner or Admin)

### Users Endpoints

`GET /users`

- Get all users
- Protected endpoint (Admin only)

`PATCH /users/:id/role`

- Update user role
- Protected endpoint (Admin only)

`DELETE /users/:id`

- Delete user
- Protected endpoint (Admin only)

## Error Handling

The API returns standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses include a message explaining what went wrong.
