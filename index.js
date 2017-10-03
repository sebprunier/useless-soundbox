const express = require('express')
const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server)

const PORT = process.env.PORT || 3000
const SOCKETIO_URI = process.env.SOCKETIO_URI || `http://localhost:${PORT}`

const REDIS_URL = process.env.REDIS_URL
console.log(`REDIS_URL is ${REDIS_URL}`)
const redis = require('redis')
let redisClient
if (REDIS_URL) {
  redisClient = redis.createClient({url : REDIS_URL})
  redisClient.on('error', (error) => {
    console.error('Redis client error');
    console.error(error);
  });
}

const trackSound = (soundId) => {
  if (redisClient) {
    console.log(`+1 for sound ${soundId}`)
    redisClient.hincrby('soundbox:sounds_hits', soundId, 1, redisClient.print)
  }
}

app.use(express.static('public'))

app.get('/api/config', (req, res) => {
  res.json({
    socketioUri: SOCKETIO_URI
  })
})

app.post('/api/track/play_sound/:id', (req, res) => {
  const soundId = req.params.id
  trackSound(soundId)
  res.status(201).send()
})

app.get('/api/stats', (req, res) => {
  if (redisClient) {
    redisClient.hgetall('soundbox:sounds_hits', (err, obj) => {
      if (err) {
        console.error(err)
        res.status(500).send('Error while getting stats: ' + error.message)
      } else {
        res.json(
          Object.keys(obj).map(key => {
            return {
              sound: key,
              hits: parseInt(obj[key], 10)
            }
          }).sort((s1, s2) => {
            return s2.hits - s1.hits
          })
        )
      }
    })
  } else {
    res.status(503).send('Service Unavailable')
  }
})

app.get('/api/play_sound/:id', (req, res) => {
  const soundId = req.params.id
  console.log(`Sending event to play sound: ${soundId}`)
  io.emit('play_sound', { id: soundId })
  trackSound(soundId)
  res.status(201).send()
})

io.on('connection', (socket) => {
  console.log('sockect.io connected')
});

server.listen(PORT, () => console.log(`Useless SoundBox listening on port ${PORT}`))
