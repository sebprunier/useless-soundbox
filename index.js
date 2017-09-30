const express = require('express')
const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server)

const PORT = process.env.PORT || 3000
const SOCKETIO_URI = process.env.SOCKETIO_URI || `http://localhost:${PORT}`

const REDIS_URL = process.env.REDIS_URL
if (REDIS_URL) {
  const redis = require('redis')
  const redisClient = redis.createClient({url : REDIS_URL})
  redisClient.on('error', (error) => {
    console.error('Redis client error');
    console.error(error);
  });
}

app.use(express.static('public'))

app.get('/api/config', (req, res) => {
  res.json({
    socketioUri: SOCKETIO_URI
  })
})

app.post('/api/track/play_sound/:id', (req, res) => {
  const soundId = req.params.id
  console.log(`+1 for sound ${soundId}`)
  if (REDIS_URL) {
    redisClient.incr(soundId, redisClient.print)
  }
  res.status(201).send()
})

app.get('/api/play_sound/:id', (req, res) => {
  const soundId = req.params.id
  console.log(`Sending event to play sound: ${soundId}`)
  io.emit('play_sound', { id: soundId })
  res.status(201).send()
})

io.on('connection', (socket) => {
  console.log('sockect.io connected')
});

server.listen(PORT, () => console.log(`Useless SoundBox listening on port ${PORT}`))
