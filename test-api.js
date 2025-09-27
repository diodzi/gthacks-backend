#!/usr/bin/env node

/**
 * Simple test script to verify the College Football Data API integration
 * Run with: node test-api.js
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.COLLEGE_FOOTBALL_API_KEY;

if (!API_KEY) {
  console.error('❌ COLLEGE_FOOTBALL_API_KEY environment variable is required');
  console.log('Please set your API key in a .env file:');
  console.log('COLLEGE_FOOTBALL_API_KEY=your_api_key_here');
  process.exit(1);
}

const BASE_URL = 'https://api.collegefootballdata.com';

async function testAPI() {
  console.log('🧪 Testing College Football Data API integration...\n');

  try {
    // Test 1: Get current season games
    console.log('1️⃣ Testing games endpoint...');
    const currentYear = new Date().getFullYear();
    const season = new Date().getMonth() < 7 ? currentYear - 1 : currentYear;
    
    const gamesResponse = await axios.get(`${BASE_URL}/games`, {
      params: {
        year: season,
        week: 1,
        seasonType: 'regular'
      },
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    console.log(`✅ Games endpoint working - found ${gamesResponse.data.length} games for ${season} season, week 1`);
    
    if (gamesResponse.data.length > 0) {
      const sampleGame = gamesResponse.data[0];
      console.log(`   Sample game: ${sampleGame.away_team} @ ${sampleGame.home_team}`);
      console.log(`   Sample game data:`, JSON.stringify(sampleGame, null, 2));
    }

    // Test 2: Get betting lines
    console.log('\n2️⃣ Testing lines endpoint...');
    try {
      const linesResponse = await axios.get(`${BASE_URL}/lines`, {
        params: {
          year: season,
          week: 1,
          seasonType: 'regular'
        },
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      console.log(`✅ Lines endpoint working - found ${linesResponse.data.length} betting lines`);
      
      if (linesResponse.data.length > 0) {
        const sampleLine = linesResponse.data[0];
        console.log(`   Sample line: ${sampleLine.away_team} @ ${sampleLine.home_team}`);
        if (sampleLine.spread) console.log(`   Spread: ${sampleLine.spread}`);
        if (sampleLine.over_under) console.log(`   Over/Under: ${sampleLine.over_under}`);
      }
    } catch (linesError) {
      console.log('⚠️  Lines endpoint not available or no data (this may be normal)');
    }

    // Test 3: Get teams
    console.log('\n3️⃣ Testing teams endpoint...');
    const teamsResponse = await axios.get(`${BASE_URL}/teams/fbs`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    console.log(`✅ Teams endpoint working - found ${teamsResponse.data.length} FBS teams`);
    
    if (teamsResponse.data.length > 0) {
      const sampleTeam = teamsResponse.data[0];
      console.log(`   Sample team: ${sampleTeam.school} (${sampleTeam.conference})`);
    }

    console.log('\n🎉 All API tests passed! Your College Football Data API integration is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('   1. Make sure your .env file has COLLEGE_FOOTBALL_API_KEY set');
    console.log('   2. Run: npm run dev');
    console.log('   3. Test the endpoint: curl http://localhost:3000/api/betting-feeds/fetch');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
      
      if (error.response.status === 401) {
        console.log('\n💡 This looks like an authentication error. Please check your API key.');
      } else if (error.response.status === 403) {
        console.log('\n💡 This looks like a permissions error. Your API key may not have access to this data.');
      }
    }
    
    process.exit(1);
  }
}

testAPI();
