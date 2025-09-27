# GTHacks Backend

A Node.js backend API for college football betting predictions.

## Setup

```bash
npm install
npm run dev
```

```
open http://localhost:3000
```

## Testing the API Integration

Before running the server, you can test your College Football Data API key:

```bash
npm run test-api
```

This will verify that your API key works and test the main endpoints used by the application.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# College Football Data API Key (REQUIRED)
COLLEGE_FOOTBALL_API_KEY=your_api_key_here

# Database Configuration (REQUIRED)
DATABASE_URL=mysql://username:password@localhost:3306/database_name
```

**Important**: 
- Replace `your_api_key_here` with your actual College Football Data API key (get it from collegefootballdata.com)
- Replace the database URL with your actual MySQL connection string
- Never commit the `.env` file to version control

## Database Setup

Run the migration to create the betting feeds table:

```sql
-- Execute the SQL in migrations/001_create_betting_feeds.sql
```

## API Endpoints

### Betting Feeds

- `GET /api/betting-feeds/fetch` - Fetch and store college football betting data from College Football Data API (limited to next 7 days)
- `GET /api/betting-feeds` - Get all stored betting feeds
- `GET /api/betting-feeds/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get betting feeds within a date range

### Example Usage

```bash
# Fetch latest betting data
curl http://localhost:3000/api/betting-feeds/fetch

# Get all stored feeds
curl http://localhost:3000/api/betting-feeds

# Get feeds for specific date range
curl "http://localhost:3000/api/betting-feeds/range?startDate=2024-01-01&endDate=2024-01-07"
```

## Features

- **College Football Only**: Fetches only college football games and betting data
- **7-Day Limit**: Automatically limits data to the next 7 days for prediction purposes
- **Betting Types Supported**:
  - Team vs Team (Point Spread, Money Line, Over/Under)
  - Player props (when available)
- **Automatic Updates**: Checks for existing games and updates odds when available
- **Error Handling**: Graceful handling of API failures and missing data
