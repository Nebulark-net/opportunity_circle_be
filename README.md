# Opportunity Circle Backend

Industrial-grade backend for a two-sided marketplace connecting organizations with seekers.

## Tech Stack
- Node.js (ESM)
- Express
- MongoDB (Mongoose)
- JWT (Auth)
- Cloudinary (Media)
- Nodemailer (Email)
- Zod (Validation)
- Docker

## Getting Started

### Prerequisites
- Node.js v20+
- MongoDB
- Docker (Optional)

### Installation
1. Clone the repo
2. `cd backend`
3. `npm install`
4. Configure `.env` (use `.env.example` as template)
5. `npm run dev`

## Docker Deployment (Production)

This project is designed to be deployed as a full stack using Docker Compose from the root of the repository.

1.  **Configure Root `.env`**: Create a `.env` file in the project root. Use the `.env.example` as a template.
2.  **Run Docker Compose**:
    ```bash
    # From the repository root
    docker-compose up --build -d
    ```
3.  **Verify**: Access the application at `http://localhost:${APP_PORT}` (as defined in your `.env` file).


## API Features
- **Multi-role Auth**: Seeker, Publisher, Admin.
- **Seeker Onboarding**: 3-step personalized onboarding flow with preference synchronization.
- **Seeker Profiles**: Professional profile management with Cloudinary image upload integration.
- **Opportunity Feed**: Filtered and paginated opportunity delivery for seekers.
- **I18n**: Support for multi-language content.
- **Robust Validation**: Zod-powered schema validation.
- **Traceability**: x-correlation-id in all requests.
- **Soft Delete**: Data integrity preserved through soft deletes.

## Documentation
Detailed API documentation can be found in `docs/API_ENDPOINTS.md`.
