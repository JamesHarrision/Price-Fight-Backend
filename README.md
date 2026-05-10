# 🔨 Price Fight - Backend API

> A robust, real-time backend API for the "Price Fight" auction platform. This system handles user authentication, live bidding synchronization, and automated auction event lifecycles.

## 🚀 Key Features

- **Real-time Bidding:** Seamless, instant bid updates powered by Firebase Realtime Database.
- **Event Lifecycle Management:** Automated handling of auction start/end states using cron jobs.
- **Secure Authentication:** JWT-based user authentication and role-based access control (Admin/User).
- **Media Management:** Direct integration with Cloudinary for fast and secure image uploads.
- **Automated Notifications:** Email alerts for auction winners and account activities via Nodemailer.
- **Clean Architecture:** Built with the Repository Pattern to strictly decouple data access from business logic.

## 🛠️ Tech Stack

- **Core:** Node.js, Express.js, TypeScript
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Real-time Engine:** Firebase Realtime Database
- **Cloud Services:** Cloudinary (Images)
- **Utilities:** JWT (Auth), Nodemailer (Emails), Zod (Validation), node-cron (Scheduling)

## 📁 Project Structure

This project follows a layered architecture utilizing the **Repository Pattern**:

```text
src/
├── config/         # Environment, Database, and 3rd-party configurations
├── controllers/    # Request handling and HTTP responses
├── jobs/           # Scheduled tasks (Cron jobs for auction lifecycle)
├── middlewares/    # Custom middlewares (Auth, Error handling)
├── repositories/   # Direct database interaction layer (Prisma)
├── routes/         # Express route definitions
├── services/       # Core business logic processing
└── utils/          # Helper functions and utilities
```

⚙️ Getting Started
Prerequisites
Node.js (v18+)

PostgreSQL

Firebase Project Account

Cloudinary Account

Installation
Clone the repository:

```Bash
git clone [https://github.com/your-username/price-fight-backend.git](https://github.com/your-username/price-fight-backend.git)
cd price-fight-backend
```
Install dependencies:


```Bash
npm install
```
Environment Setup:
Create a .env file in the root directory and configure the following variables (see .env.example for reference):

```
Đoạn mã
PORT=
DATABASE_URL=
JWT_SECRET=
FIREBASE_...=
CLOUDINARY_...=
SMTP_...=
```

Database Migration:
Generate the Prisma client and push the schema to your PostgreSQL database:

```Bash
npx prisma generate
npx prisma db push
```

Start the development server:

```Bash
npm run dev
```
