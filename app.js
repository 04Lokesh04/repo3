const express = require('express')

const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

app.get('/players/', async (request, response) => {
  const query = `
  select
   * 
  from 
  cricket_team;`
  const result = await db.all(query)
  const converttoobj = eachplayer => {
    return {
      playerId: eachplayer.player_id,
      playerName: eachplayer.player_name,
      jerseyNumber: eachplayer.jersey_number,
      role: eachplayer.role,
    }
  }

  response.send(result.map(eachplayer => converttoobj(eachplayer)))
})

app.post('/players/', async (request, response) => {
  const details = request.body
  const {playerName, jerseyNumber, role} = details

  const addquery = `Insert
  into 
  cricket_team(player_name, jersey_number, role)
  values
  ('${playerName}',${jerseyNumber},'${role}' );
  `
  await db.run(addquery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const query = `
  select 
  *
  from 
  cricket_team
  where 
  player_id=${playerId};`

  const dbresponse = await db.get(query)
  response.send(dbresponse)
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerdetails = request.body
  const {playerName, jerseyNumber, role} = playerdetails
  const updatequery = `
  update 
  cricket_team
  set
  player_name='${playerName}',
  jersey_number=${jerseyNumber},
  role='${role}'
  where 
  player_id=${playerId};
  `
  await db.run(updatequery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletequery = `delete
  from
  cricket_team
  where 
  player_id=${playerId};`
  await db.run(deletequery)
  response.send('Player Removed')
})
module.exports = app
