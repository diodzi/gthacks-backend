import axios from 'axios'

export interface BettingFeed {
  GameID: number
  Season: number
  Week: number
  SeasonType: string
  GameDate: string
  HomeTeam: string
  AwayTeam: string
  HomeTeamID: number
  AwayTeamID: number
  HomeTeamScore?: number
  AwayTeamScore?: number
  PointSpread?: number
  OverUnder?: number
  HomeTeamMoneyLine?: number
  AwayTeamMoneyLine?: number
  Updated: string
}

// College Football Data API interfaces
interface CollegeFootballGame {
  id: number
  season: number
  week: number
  seasonType: string
  startDate: string
  neutralSite: boolean
  homeTeam: string
  homeId: number
  homeConference?: string
  homePoints?: number
  awayTeam: string
  awayId: number
  awayConference?: string
  awayPoints?: number
  completed: boolean
}

interface CollegeFootballLine {
  id: number
  season: number
  season_type: string
  week: number
  game_id: number
  home_team: string
  home_conference?: string
  home_score?: number
  away_team: string
  away_conference?: string
  away_score?: number
  spread?: number
  over_under?: number
  home_moneyline?: number
  away_moneyline?: number
  updated: string
}

export class CollegeFootballDataService {
  private apiKey: string
  private baseUrl = 'https://api.collegefootballdata.com'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Fetch college football betting feeds for the current season
   */
  async getBettingFeeds(): Promise<BettingFeed[]> {
    try {
      // Get current season
      const currentSeason = await this.getCurrentSeason()
      console.log(`🔍 Debug: Current season: ${currentSeason}`)

      const allFeeds: BettingFeed[] = []

      // Fetch data for all weeks of the current season
      for (let week = 1; week <= 16; week++) { // College football typically has 16 weeks
        console.log(`🔍 Debug: Fetching data for week ${week}`)
        try {
          // Get games for the week
          const gamesResponse = await axios.get(
            `${this.baseUrl}/games`,
            {
              params: {
                year: currentSeason,
                week: week,
                seasonType: 'regular'
              },
              headers: {
                'Authorization': `Bearer ${this.apiKey}`
              }
            }
          )

          const games: CollegeFootballGame[] = gamesResponse.data
          console.log(`🔍 Debug: Found ${games.length} total games for week ${week}`)
          
          // Use all games for this week (no date filtering)
          const filteredGames = games
          console.log(`🔍 Debug: Using all ${filteredGames.length} games for week ${week}`)

          // Get betting lines for the week
          let bettingLines: CollegeFootballLine[] = []
          try {
            const linesResponse = await axios.get(
              `${this.baseUrl}/lines`,
              {
                params: {
                  year: currentSeason,
                  week: week,
                  seasonType: 'regular'
                },
                headers: {
                  'Authorization': `Bearer ${this.apiKey}`
                }
              }
            )
            bettingLines = linesResponse.data
          } catch (linesError) {
            console.warn(`Failed to fetch betting lines for week ${week}:`, linesError)
          }

          // Combine games with their betting lines
          for (const game of filteredGames) {
            // Validate that the game has all required fields (using correct API field names)
            if (!game.id || !game.season || !game.week || !game.seasonType || !game.startDate || 
                !game.homeTeam || !game.awayTeam || !game.homeId || !game.awayId) {
              console.log(`⚠️ Skipping game ${game.id} - missing required fields`)
              continue
            }

            const gameLines = bettingLines.filter(line => line.game_id === game.id)
            const primaryLine = gameLines.length > 0 ? gameLines[0] : null

            const bettingFeed: BettingFeed = {
              GameID: game.id,
              Season: game.season,
              Week: game.week,
              SeasonType: game.seasonType,
              GameDate: game.startDate,
              HomeTeam: game.homeTeam,
              AwayTeam: game.awayTeam,
              HomeTeamID: game.homeId,
              AwayTeamID: game.awayId,
              HomeTeamScore: game.homePoints,
              AwayTeamScore: game.awayPoints,
              PointSpread: primaryLine?.spread,
              OverUnder: primaryLine?.over_under,
              HomeTeamMoneyLine: primaryLine?.home_moneyline,
              AwayTeamMoneyLine: primaryLine?.away_moneyline,
              Updated: primaryLine?.updated || new Date().toISOString()
            }

            allFeeds.push(bettingFeed)
          }
        } catch (weekError) {
          if (axios.isAxiosError(weekError) && weekError.response?.status === 404) {
            console.warn(`Week ${week} data is not available for season ${currentSeason}. Stopping here as we've likely reached the end of available data.`)
            break // Stop fetching if we hit a 404, as subsequent weeks likely won't have data
          } else {
            console.warn(`Failed to fetch data for week ${week}:`, weekError)
          }
        }
      }

      return allFeeds
    } catch (error) {
      console.error('Error fetching betting feeds:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to fetch betting feeds from College Football Data API: ${error.message}`)
      }
      throw new Error('Failed to fetch betting feeds from College Football Data API')
    }
  }

  /**
   * Get the current season
   */
  private async getCurrentSeason(): Promise<number> {
    try {
      // Use 2025 season as it's the most current and has data available
      // College football season typically runs from August to January
      const currentDate = new Date()
      let season = 2025 // Use 2025 season for current data
      
      console.log(`🔍 Debug: Using season ${season} for data fetching`)
      return season
    } catch (error) {
      console.warn('Failed to get current season, using fallback:', error)
      return 2025 // Fallback to 2025
    }
  }

  /**
   * Get the current week of the college football season
   */
  private async getCurrentWeek(season: number): Promise<number> {
    try {
      // Try to get games for the current season to determine the current week
      const response = await axios.get(
        `${this.baseUrl}/games`,
        {
          params: {
            year: season,
            seasonType: 'regular'
          },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      )

      const games = response.data
      if (games.length === 0) {
        console.warn('No games found for current season, defaulting to week 1')
        return 1
      }

      // Find the most recent week with games
      const currentDate = new Date()
      const upcomingGames = games.filter((game: any) => new Date(game.start_date) >= currentDate)
      
      if (upcomingGames.length > 0) {
        // Return the week of the next upcoming game
        return upcomingGames[0].week
      } else {
        // If no upcoming games, return the last week of the season
        const lastWeek = Math.max(...games.map((game: any) => game.week))
        return lastWeek
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Current week data is not available. The season may not have started yet or may have ended.`)
      }
      console.warn('Failed to get current week, defaulting to week 1:', error)
      return 1
    }
  }

  /**
   * Check if a season is available
   */
  async isSeasonAvailable(season: number): Promise<boolean> {
    try {
      await axios.get(
        `${this.baseUrl}/games`,
        {
          params: {
            year: season,
            seasonType: 'regular'
          },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      )
      return true
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false
      }
      // For other errors, assume season is available and let the actual call handle it
      return true
    }
  }

  /**
   * Get team information for better display
   */
  async getTeams(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/teams/fbs`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching teams:', error)
      throw new Error('Failed to fetch teams from College Football Data API')
    }
  }
}
