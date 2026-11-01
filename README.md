# GOODWAVE — Backend API

Backend service for **GOODWAVE**, a Social Development Events Platform that connects people with community-driven initiatives and volunteering opportunities.

## Overview

GOODWAVE provides RESTful APIs for managing community events, discovering upcoming activities, and supporting user participation.

## Technology Stack

- Node.js
- Express.js
- MongoDB
- JavaScript
- REST API
- dotenv
- CORS

## Current Features

- MongoDB database connection
- Create community events
- Retrieve upcoming events
- Filter events by category
- Search events by title, location, and description
- Retrieve individual event details
- Limit event results
- Validate event information and future event dates

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB database

### Installation

```bash
git clone https://github.com/abubakar787/goodwave-server.git
cd goodwave-server
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
```

Never commit your actual `.env` file or database credentials.

### Run the Development Server

```bash
npm run dev
```

The API will run at:

`http://localhost:8000`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Server health check |
| GET | `/api/events` | Get upcoming events |
| GET | `/api/events?limit=6` | Get limited upcoming events |
| GET | `/api/events?category=Donation` | Filter by category |
| GET | `/api/events?search=Dhaka` | Search events |
| GET | `/api/events/:id` | Get event details |
| POST | `/api/events` | Create an event |

## Project Structure

```text
goodwave-server/
├── index.js
├── seed.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── README.md
```

## Project Status

Currently under active development. Authentication, event participation, event ownership, and additional protected APIs are planned.

## Frontend

[GOODWAVE Frontend Repository](https://github.com/abubakar787/goodwave)

## License

This project is developed for educational and portfolio purposes.
