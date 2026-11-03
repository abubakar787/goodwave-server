# 🌱 GOODWAVE — Backend API

The GOODWAVE backend is a RESTful API built with Node.js, Express.js, and MongoDB. It handles event management, user participation, protected routes, JWT authentication, and database operations for the GOODWAVE platform.

**Frontend:** https://goodwave-wine.vercel.app/

**Backend API:** https://goodwave-server.vercel.app/

**Health Check:** https://goodwave-server.vercel.app/api/health

## ✨ Key Features

- **Event Management:** Create, retrieve, update, and delete community events.
- **Upcoming Events:** Retrieve upcoming events with category filtering and search.
- **Event Details:** Fetch individual event information.
- **JWT Authentication:** Verify Better Auth JWT tokens using JWKS.
- **Protected Routes:** Secure event creation and user-specific operations.
- **Event Ownership:** Only event owners can update or delete their events.
- **Join Events:** Allow authenticated users to join upcoming events.
- **Duplicate Prevention:** Prevent users from joining the same event more than once.
- **Joined Events:** Retrieve events joined by the authenticated user.
- **Database Connection:** Connect to MongoDB Atlas.
- **Health Monitoring:** Check API and database connectivity.
- **CORS Configuration:** Allow requests from the frontend application.

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- MongoDB Node.js Driver
- JavaScript (ES Modules)
- JWT
- JOSE
- CORS
- dotenv
- Vercel

## 📁 Project Structure

```text
goodwave-server/
├── index.js
├── package.json
├── package-lock.json
├── .env
└── README.md
```

## 🔌 API Endpoints

### Public Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check server status |
| GET | `/api/events` | Get upcoming events |
| GET | `/api/events/:id` | Get event details |
| GET | `/api/health` | Check API and database health |

### Protected Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/events` | Create an event |
| GET | `/api/my-events` | Get events created by the user |
| PATCH | `/api/events/:id` | Update an owned event |
| DELETE | `/api/events/:id` | Delete an owned event |
| POST | `/api/events/:id/join` | Join an event |
| GET | `/api/joined-events` | Get joined events |
| GET | `/api/events/:id/join-status` | Check event join status |

Protected endpoints require a valid Bearer JWT token.

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/abubakar787/goodwave-server.git
```

### 2. Navigate to the project directory

```bash
cd goodwave-server
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root.

```env
PORT=8000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

BETTER_AUTH_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
```

Never commit your `.env` file or expose database credentials and secrets publicly.

### 5. Start the development server

```bash
npm run dev
```

The API will run at:

http://localhost:8000

## 🗄️ Database

**Database:** `goodwaveDB`

**Collections:**

- `events` — Stores event information and organizer details.
- `joinedEvents` — Stores event participation records.

A unique compound index on `eventId` and `userId` prevents duplicate event registrations.

## 🔐 Authentication

The backend verifies Better Auth JWT tokens using the JSON Web Key Set (JWKS) endpoint.

JWT verification includes:

- Token signature verification.
- Issuer validation.
- Audience validation.
- Token expiration validation.
- User identity extraction.

Protected operations use the authenticated user's identity to enforce event ownership and participation rules.

## 🚀 Deployment

The backend API is deployed on Vercel.

- **Production API:** https://goodwave-server.vercel.app/
- **Health Check:** https://goodwave-server.vercel.app/api/health

## 👨‍💻 Developer

**Mohammad Abubakar**

- GitHub: https://github.com/abubakar787
- LinkedIn: https://www.linkedin.com/

---

**GOODWAVE — Small Actions. Lasting Impact.** 🌱
