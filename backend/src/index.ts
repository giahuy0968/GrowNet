import express from 'express'
import path from 'path'
import fs from 'fs'

const app = express()
const port = process.env.PORT || 4000

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.get('/api/locales/en', (req, res) => {
  const p = path.join(__dirname, '../../Home/locales/en.json')
  if (fs.existsSync(p)) {
    const raw = fs.readFileSync(p, 'utf8')
    try {
      const json = JSON.parse(raw)
      res.json(json)
    } catch (e) {
      res.status(500).json({ error: 'invalid locale JSON' })
    }
  } else {
    res.status(404).json({ error: 'locale not found' })
  }
})

app.use(express.static(path.join(__dirname, '../../Home/public')))

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
