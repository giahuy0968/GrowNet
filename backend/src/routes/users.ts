import { Router } from 'express'
import User from '../models/User'

const router = Router()

router.get('/', async (_req, res) => {
    const list = await User.find().limit(50)
    res.json(list)
})

router.post('/', async (req, res) => {
    try {
        const created = await User.create(req.body)
        res.status(201).json(created)
    } catch (e) {
        res.status(400).json({ error: 'Cannot create user', detail: (e as Error).message })
    }
})

export default router