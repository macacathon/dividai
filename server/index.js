import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import pkg from '../src/generated/prisma/index.js'
const { PrismaClient } = pkg

const prisma = new PrismaClient()
const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ ok: true, message: 'Dividai API' })
})

// Users
app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany()
    res.json(users)
})

app.post('/users', async (req, res) => {
    const { email, name } = req.body
    try {
        const user = await prisma.user.create({ data: { email, name } })
        res.status(201).json(user)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// Groups
app.get('/groups', async (req, res) => {
    const groups = await prisma.group.findMany()
    res.json(groups)
})

app.post('/groups', async (req, res) => {
    const { name, members = '', total = 0 } = req.body
    try {
        const group = await prisma.group.create({ data: { name, members, total: Number(total) } })
        res.status(201).json(group)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// Delete group and its expenses
app.delete('/groups/:id', async (req, res) => {
    const { id } = req.params
    try {
        // delete expenses belonging to group
        await prisma.expense.deleteMany({ where: { groupId: id } })
        // delete group
        await prisma.group.delete({ where: { id } })
        res.json({ ok: true })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// Expenses
app.get('/expenses', async (req, res) => {
    const expenses = await prisma.expense.findMany()
    res.json(expenses)
})

app.post('/expenses', async (req, res) => {
    const { description, amount, paidBy, groupId } = req.body
    try {
        const expense = await prisma.expense.create({ data: { description, amount: Number(amount), paidBy, groupId } })

        // update group total
        try {
            const group = await prisma.group.findUnique({ where: { id: groupId } })
            if (group) {
                await prisma.group.update({ where: { id: groupId }, data: { total: Number(group.total || 0) + Number(amount) } })
            }
        } catch (e) {
            console.warn('Failed updating group total', e)
        }

        res.status(201).json(expense)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// Delete an expense and update group total
app.delete('/expenses/:id', async (req, res) => {
    const { id } = req.params
    try {
        const expense = await prisma.expense.findUnique({ where: { id } })
        if (!expense) return res.status(404).json({ error: 'Not found' })

        await prisma.expense.delete({ where: { id } })

        try {
            const group = await prisma.group.findUnique({ where: { id: expense.groupId } })
            if (group) {
                await prisma.group.update({ where: { id: group.id }, data: { total: Number(group.total || 0) - Number(expense.amount) } })
            }
        } catch (e) {
            console.warn('Failed updating group total after expense delete', e)
        }

        res.json({ ok: true })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// Settlements
app.get('/settlements', async (req, res) => {
    const settlements = await prisma.settlement.findMany()
    res.json(settlements)
})

app.post('/settlements', async (req, res) => {
    const { fromUser, toUser, amount, groupId } = req.body
    try {
        const settlement = await prisma.settlement.create({ data: { fromUser, toUser, amount: Number(amount), groupId } })
        res.status(201).json(settlement)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

const port = process.env.PORT || 4000
const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})

process.on('SIGINT', async () => {
    await prisma.$disconnect()
    server.close(() => process.exit(0))
})
