# PuntHub - Database Setup Guide

This guide will help you set up the database and get started with the PuntHub betting prediction aggregator.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or use SQLite for local development)
- npm or yarn package manager

---

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Prisma ORM and Prisma Client
- React and Vite
- TypeScript tooling

### 2. Configure Database

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your database connection string:

#### For PostgreSQL (Production):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/punthub?schema=public"
```

#### For SQLite (Local Development):
```env
DATABASE_URL="file:./dev.db"
```

**Note:** If using SQLite, change the `provider` in `prisma/schema.prisma` from `postgresql` to `sqlite`.

### 3. Generate Prisma Client

```bash
npx prisma generate
```

This generates the TypeScript types and Prisma Client based on your schema.

### 4. Run Migrations

Apply the database migrations to create all tables:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the database if it doesn't exist
- Apply all migrations to create tables
- Generate the Prisma Client

### 5. Seed the Database (Optional)

Populate your database with sample data:

```bash
npx prisma db seed
```

This creates:
- 2 sample users
- 1 sample fixture (Liverpool vs Manchester United)
- Odds from 3 platforms (Hollywoodbets, Sportingbet, Supabets)

---

## Development Workflow

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### View Database (Prisma Studio)

Open Prisma Studio to browse and edit your database:

```bash
npm run prisma:studio
```

This opens a GUI at `http://localhost:5555`

### Creating New Migrations

After modifying `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name describe_your_changes
```

---

## Production Deployment

### Set Environment Variables

In your Vercel project settings (or hosting platform), add:

```env
DATABASE_URL=postgresql://username:password@host:5432/database
```

### Apply Migrations

In your deployment pipeline or manually:

```bash
npx prisma migrate deploy
```

This applies pending migrations without interactive prompts.

### Generate Prisma Client

Ensure this runs during your build process:

```bash
npx prisma generate
```

---

## Database Schema Overview

### Users Table
Stores user information and Puntpoints balances.

### Fixtures Table
Stores upcoming matches/events with categories and status.

### Odds Table
Stores betting odds from multiple platforms for each fixture.

### Predictions Table
Stores user predictions with stakes and results.

---

## Troubleshooting

### "Can't reach database server"
- Verify your `DATABASE_URL` is correct
- Check that PostgreSQL is running
- Verify firewall/network access

### "No migrations found"
- Run `npx prisma migrate dev` to create migrations
- Check that `prisma/migrations/` directory exists

### "Client not generated"
- Run `npx prisma generate`
- Restart your TypeScript server/IDE

---

## Next Steps

1. Create API endpoints in `api/` directory
2. Connect frontend to your new API endpoints
3. Implement odds aggregation from betting platforms
4. Build prediction submission and scoring logic

For API examples, see `api/fixtures/list.ts`
