import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/mysql2'
import { usersTable, bettingFeedsTable } from './db/schema.js'
import { db } from './db/index.js'
import { CollegeFootballDataService } from './services/sportsDataService.js'
import { eq, and, gte, lte } from 'drizzle-orm'

const app = new Hono()

if (!process.env.COLLEGE_FOOTBALL_API_KEY) {
  console.error('error: COLLEGE_FOOTBALL_API_KEY environment variable is required')
  process.exit(1)
}

const collegeFootballDataService = new CollegeFootballDataService(process.env.COLLEGE_FOOTBALL_API_KEY)

app.get('/', (c) => {
  return c.text('Hello Allan!')
})

app.get('/api/sqlTest', async (c) => {
  const msg = await db.select().from(usersTable)

  console.log(msg)

  return c.json({
    ok: true,
    message: msg[0],
  })
})

app.get('/api/betting-feeds/fetch', async (c) => {
  try {
    console.log('Fetching betting feeds from College Football Data API...')
    const bettingFeeds = await collegeFootballDataService.getBettingFeeds()
    
    console.log(`Fetched ${bettingFeeds.length} betting feeds`)
    
    // Limit to first 100 feeds for now to avoid timeout
    const limitedFeeds = bettingFeeds.slice(0, 100)
    console.log(`🔍 Debug: Processing ${limitedFeeds.length} feeds (limited from ${bettingFeeds.length}) for database storage`)
    
    const storedFeeds = []
    
    for (const feed of limitedFeeds) {
      try {
        // Validate required fields
        if (!feed.GameID || !feed.Season || !feed.Week || !feed.SeasonType || !feed.GameDate || !feed.HomeTeam || !feed.AwayTeam || !feed.HomeTeamID || !feed.AwayTeamID) {
          console.log(`⚠️ Skipping feed ${feed.GameID} - missing required fields`)
          continue
        }

        // Validate and parse dates
        const gameDate = new Date(feed.GameDate)
        const updatedDate = new Date(feed.Updated)
        
        if (isNaN(gameDate.getTime()) || isNaN(updatedDate.getTime())) {
          console.log(`⚠️ Skipping feed ${feed.GameID} - invalid date values`)
          continue
        }

        console.log(`🔍 Debug: Processing feed ${feed.GameID}: ${feed.AwayTeam} @ ${feed.HomeTeam}`)
        
        const existingGame = await db.select()
          .from(bettingFeedsTable)
          .where(eq(bettingFeedsTable.gameId, feed.GameID))
          .limit(1)

        console.log(`🔍 Debug: Existing game check for ${feed.GameID}: ${existingGame.length} found`)

        if (existingGame.length === 0) {
          console.log(`🔍 Debug: Inserting new game ${feed.GameID}: ${feed.AwayTeam} @ ${feed.HomeTeam}`)
          const insertResult = await db.insert(bettingFeedsTable).values({
            gameId: feed.GameID,
            season: feed.Season,
            week: feed.Week,
            seasonType: feed.SeasonType,
            gameDate: gameDate,
            homeTeam: feed.HomeTeam,
            awayTeam: feed.AwayTeam,
            homeTeamId: feed.HomeTeamID,
            awayTeamId: feed.AwayTeamID,
            homeTeamScore: feed.HomeTeamScore,
            awayTeamScore: feed.AwayTeamScore,
            pointSpread: feed.PointSpread?.toString(),
            overUnder: feed.OverUnder?.toString(),
            homeTeamMoneyLine: feed.HomeTeamMoneyLine,
            awayTeamMoneyLine: feed.AwayTeamMoneyLine,
            updated: updatedDate
          })
          
          console.log(`🔍 Debug: Insert result for ${feed.GameID}:`, insertResult)
          storedFeeds.push(feed)
        } else {
          console.log(`🔍 Debug: Updating existing game ${feed.GameID}: ${feed.AwayTeam} @ ${feed.HomeTeam}`)
          // Update existing game
          const updateResult = await db.update(bettingFeedsTable)
            .set({
              homeTeamScore: feed.HomeTeamScore,
              awayTeamScore: feed.AwayTeamScore,
              pointSpread: feed.PointSpread?.toString(),
              overUnder: feed.OverUnder?.toString(),
              homeTeamMoneyLine: feed.HomeTeamMoneyLine,
              awayTeamMoneyLine: feed.AwayTeamMoneyLine,
              updated: updatedDate
            })
            .where(eq(bettingFeedsTable.gameId, feed.GameID))
          
          console.log(`🔍 Debug: Update result for ${feed.GameID}:`, updateResult)
          storedFeeds.push(feed)
        }
      } catch (dbError) {
        console.error(`❌ Error storing game ${feed.GameID}:`, dbError)
        console.error(`❌ Feed data:`, JSON.stringify(feed, null, 2))
      }
    }
    
    console.log(`🔍 Debug: Successfully processed ${storedFeeds.length} feeds`)

    return c.json({
      ok: true,
      message: `Successfully processed ${storedFeeds.length} betting feeds`,
      feeds: storedFeeds,
      totalFetched: bettingFeeds.length
    })
  } catch (error) {
    console.error('Error fetching betting feeds:', error)
    return c.json({
      ok: false,
      error: 'Failed to fetch betting feeds',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

app.get('/api/betting-feeds', async (c) => {
  try {
    const feeds = await db.select().from(bettingFeedsTable)
      .orderBy(bettingFeedsTable.gameDate)

    return c.json({
      ok: true,
      feeds: feeds,
      count: feeds.length
    })
  } catch (error) {
    console.error('Error fetching stored betting feeds:', error)
    return c.json({
      ok: false,
      error: 'Failed to fetch stored betting feeds',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

app.get('/api/betting-feeds/range', async (c) => {
  try {
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')
    
    if (!startDate || !endDate) {
      return c.json({
        ok: false,
        error: 'startDate and endDate query parameters are required'
      }, 400)
    }

    const feeds = await db.select().from(bettingFeedsTable)
      .where(
        and(
          gte(bettingFeedsTable.gameDate, new Date(startDate)),
          lte(bettingFeedsTable.gameDate, new Date(endDate))
        )
      )
      .orderBy(bettingFeedsTable.gameDate)

    return c.json({
      ok: true,
      feeds: feeds,
      count: feeds.length
    })
  } catch (error) {
    console.error('Error fetching betting feeds by range:', error)
    return c.json({
      ok: false,
      error: 'Failed to fetch betting feeds by range',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)
