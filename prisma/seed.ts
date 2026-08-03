/**
 * Seed script for PuntHub database
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      weeklyScore: 150,
      totalPuntpoints: 2500,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      weeklyScore: 200,
      totalPuntpoints: 3200,
    },
  })

  console.log('✅ Created users:', user1.email, user2.email)

  // Create sample fixture
  const fixture = await prisma.fixture.create({
    data: {
      title: 'Liverpool vs Manchester United',
      description: 'Premier League - Week 22',
      category: 'sports',
      startTime: new Date('2025-02-01T15:00:00Z'),
      endTime: new Date('2025-02-01T14:45:00Z'),
      status: 'upcoming',
      metadata: {
        league: 'Premier League',
        venue: 'Anfield',
        teams: {
          home: 'Liverpool',
          away: 'Manchester United'
        }
      },
    },
  })

  console.log('✅ Created fixture:', fixture.title)

  // Create sample odds from different platforms
  const platforms = [
    { platform: 'Hollywoodbets', outcome: 'Home Win', price: 1.85 },
    { platform: 'Hollywoodbets', outcome: 'Draw', price: 3.50 },
    { platform: 'Hollywoodbets', outcome: 'Away Win', price: 4.20 },
    { platform: 'Sportingbet', outcome: 'Home Win', price: 1.90 },
    { platform: 'Sportingbet', outcome: 'Draw', price: 3.40 },
    { platform: 'Sportingbet', outcome: 'Away Win', price: 4.00 },
    { platform: 'Supabets', outcome: 'Home Win', price: 1.88 },
    { platform: 'Supabets', outcome: 'Draw', price: 3.45 },
    { platform: 'Supabets', outcome: 'Away Win', price: 4.10 },
  ]

  for (const odd of platforms) {
    await prisma.odds.create({
      data: {
        fixtureId: fixture.id,
        ...odd,
      },
    })
  }

  console.log('✅ Created odds for', platforms.length, 'outcomes')
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
