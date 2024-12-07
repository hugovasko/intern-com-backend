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

- 5 candidate users
- 5 partner companies with 5 opportunities each
- 2 admin users

### Sample Users

#### Admins:

1. admin1@example.com / 123456
2. admin2@example.com / 123456

#### Partners:

1. partner1@company1.com / 123456
2. partner2@company2.com / 123456
   ... etc.

#### Candidates:

1. candidate1@example.com / 123456
2. candidate2@example.com / 123456
   ... etc.

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
  "salary": "string" (optional)
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
