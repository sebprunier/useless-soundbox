const express = require('express')
const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server)

const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

app.use(express.static('public'))

app.get('/api/config', (req, res) => {
  res.json({
    socketioUri: NODE_ENV === 'production' ? 'http://localhost' : `http://localhost:${PORT}`
  })
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

server.listen(PORT, () => console.log(`BeatBox listening on port ${PORT}`))
