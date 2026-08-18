# Database Seed Script

## Overview

The seed script populates the MongoDB database with realistic demo data for the N5Deal Marketplace.

## Prerequisites

1. **MongoDB Connection**: Ensure you have a valid `MONGODB_URI` in your `.env.local` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/n5deal-marketplace
```

Or for local MongoDB:

```env
MONGODB_URI=mongodb://localhost:27017/n5deal-marketplace
```

2. **Dependencies**: All required dependencies should be installed via `npm install`

## Running the Seed

```bash
npm run db:seed
```

**Note**: The seed script automatically loads environment variables from `.env.local` using Next.js's `@next/env` package (included with Next.js). No additional configuration is needed.

## What Gets Created

### Users (11 total)
- **1 Manager**: Platform administrator
- **5 Buyers**: Investment firms, private equity, family offices
- **5 Sellers**: Business owners across various industries

### Assets (12 total)
- **Businesses**: SaaS platforms, manufacturing, healthcare, e-commerce
- **Real Estate**: Office buildings, warehouses, development sites
- **Equity**: Minority stakes in startups
- **Other**: Equipment leasing portfolios

### Messages (8 total)
- Buyer-seller communications
- Asset-specific inquiries
- Platform support questions
- Mix of read/unread messages

## Features

- **Idempotent**: Clears existing data before seeding
- **Referential Integrity**: All references (sellerId, assetId, etc.) are valid
- **Realistic Data**: Industry-appropriate names, companies, and metrics
- **Validation**: Automatic verification of data integrity
- **Clear Output**: Detailed summary and validation results

## Demo Data Notes

⚠️ **IMPORTANT**: All users have a placeholder password hash:
```
DEMO_HASH_REPLACE_WITH_REAL_BCRYPT_IN_PRODUCTION
```

This is **NOT** a real bcrypt hash. When implementing authentication, you must:
1. Install bcrypt/bcryptjs
2. Generate proper password hashes
3. Never use this placeholder in production

## Expected Output

```
🌱 Starting database seed...

✓ Connected to MongoDB

🗑️  Clearing existing data...
✓ Cleared all collections

👤 Creating users...
✓ Created 5 buyers
✓ Created 5 sellers
✓ Created 1 manager

🏢 Creating assets...
✓ Created 12 assets

💬 Creating messages...
✓ Created 8 messages

🔍 Verifying seed data...

📊 SEED SUMMARY
══════════════════════════════════════════════════
Total Users:           11
  - Buyers:            5
  - Sellers:           5
  - Managers:          1
Total Assets:          12
Total Messages:        8
  - With Asset Ref:    6
══════════════════════════════════════════════════

✅ VALIDATION CHECKS
══════════════════════════════════════════════════
Assets with invalid seller:        ✓ None
Messages with invalid users:       ✓ None
Messages with invalid asset ref:   ✓ None
══════════════════════════════════════════════════

✅ Seed completed successfully!

🔌 Database connection closed
```

## Troubleshooting

### Error: "Please define the MONGODB_URI environment variable"
- Ensure `.env.local` exists in the project root
- Verify `MONGODB_URI` is set correctly
- Check that the connection string is valid

### Error: "Connection refused" or "Authentication failed"
- Verify MongoDB is running (if using local)
- Check MongoDB Atlas IP whitelist (if using Atlas)
- Verify credentials in connection string

### TypeScript path alias errors
- Ensure `tsconfig.json` has the `@/*` path mapping
- Try running `npm run build` first to generate type definitions

## Re-running the Seed

The seed script is idempotent. Running it multiple times will:
1. Delete all existing users, assets, and messages
2. Create fresh demo data
3. Maintain consistent ObjectIds (they will be different each run)

This is safe for development but **NEVER** run in production!
