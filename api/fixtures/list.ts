/**
 * GET /api/fixtures/list
 * 
 * Returns a list of upcoming fixtures with their odds
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../../lib/db'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const fixtures = await db.fixture.findMany({
      where: {
        status: 'upcoming',
        startTime: { gte: new Date() }
      },
      include: { odds: true },
      orderBy: { startTime: 'asc' }
    })
    return res.status(200).json({ fixtures })
  } catch (error) {
    console.error('Error fetching fixtures:', error)
    return res.status(500).json({ error: 'Failed to fetch fixtures' })
  }
}
