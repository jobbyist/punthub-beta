# PuntHub Migration to Betting Prediction Aggregator

## Overview

This update pivots PuntHub from a Polymarket-integrated prediction platform to a standalone betting prediction aggregator focused on South African betting platforms (Hollywoodbets, Sportingbet, Supabets).

---

## Major Changes

### ✅ Database Implementation

**Added:**
- Prisma ORM integration with PostgreSQL support
- Complete database schema with 4 main models:
  - **User**: Email, name, weeklyScore, totalPuntpoints
  - **Fixture**: Match/event details, startTime, result, status, metadata
  - **Odds**: Platform-specific betting prices for fixtures
  - **Prediction**: User predictions with stakes and results
- Initial migration script (`20250122000000_init`)
- Database client singleton (`lib/db.ts`)
- Seed script with sample data (`prisma/seed.ts`)

**Files Created:**
- `prisma/schema.prisma` - Database schema definition
- `prisma/migrations/20250122000000_init/migration.sql` - Initial migration
- `prisma/migrations/migration_lock.toml` - Migration lock file
- `prisma/seed.ts` - Database seeding script
- `lib/db.ts` - Prisma client singleton
- `api/fixtures/list.ts` - Example API endpoint

### ❌ Removed Dependencies

**Polymarket Integration:**
- Removed `@polymarket/builder-relayer-client`
- Removed `@polymarket/builder-signing-sdk`
- Removed `@polymarket/clob-client`
- Removed `ethers` library
- Removed `magic-sdk`

**Deleted Files:**
- `api/polymarket/sign.ts`
- `api/polymarket/clob/[...path].ts`
- `api/polymarket/_builderConfig.ts`
- `api/payfast/grant.ts`
- `api/payfast/notify.ts`
- `api/payfast/prepare.ts`
- `src/services/polymarket.js`
- `src/services/polymarketAuth.js`
- `src/services/magic.js`
- `src/hooks/useWallet.js`
- `src/lib/polymarket.ts`

### 📝 Documentation Updates

- `README.md` - Completely rewritten for betting aggregator focus
- `SETUP.md` - New comprehensive setup guide
- `.env.example` - Simplified to database and payment configs only

---

## Breaking Changes

1. **No Polymarket integration** - All prediction market features removed
2. **No Magic wallet** - Authentication needs to be re-implemented
3. **No Payfast payment** - Payment integration removed (PayPal/Coinbase remain as examples)
4. **Database required** - Application now requires PostgreSQL or SQLite database

---

## Migration Steps for Existing Deployments

1. Set up PostgreSQL database
2. Configure `DATABASE_URL` environment variable
3. Run `npm install` to install new dependencies
4. Run `npx prisma migrate deploy` to create tables
5. Run `npx prisma db seed` to populate sample data (optional)
6. Update frontend code to use new API endpoints
7. Implement new authentication system

---

## Next Steps

1. **Implement Authentication** - Build email-based or OAuth authentication
2. **Odds Aggregation** - Create scrapers/API integrations for betting platforms
3. **Prediction Logic** - Build submission and scoring system
4. **Weekly Leaderboard** - Implement weekly score reset logic
5. **Frontend Integration** - Connect React app to new database-backed APIs
