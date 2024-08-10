import express from 'express'
import userRouter from './routers/user'
import workerRouter from './routers/worker'
import cors from 'cors'
import morgan from 'morgan'
import cookieSession from 'cookie-session'

process.loadEnvFile()

const app = express()

app.use(express.json())
app.use(cors({
    origin: [process.env.USER_FRONTEND!, process.env.WORKER_FRONTEND!],
    credentials: true
}))
app.use(morgan('tiny'))
app.use(cookieSession({
    name: 'dFiver_session',
    secret: process.env.COOKIE_SECRET,
    maxAge: 1 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    signed: true,
    overwrite: true
}))

app.use('/v1/user', userRouter)
app.use('/v1/worker', workerRouter)

const port = 8000
app.listen(port, () => {
    console.log(`Server PORT : ${port}`)
})