import express from 'express'
import userRouter from './routers/user'
import workerRouter from './routers/worker'
import cors from 'cors'
import morgan from 'morgan'
import cookieSession from 'cookie-session'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

process.loadEnvFile()

const app = express()
const httpServer = createServer(app)

app.use(express.json())
app.use(cors({
    origin: [process.env.USER_FRONTEND!, process.env.WORKER_FRONTEND!],
    credentials: true
}))
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
app.use(morgan('tiny'))



app.use('/v1/user', userRouter)
app.use('/v1/worker', workerRouter)


const io = new Server(httpServer, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? [process.env.USER_FRONTEND!, process.env.WORKER_FRONTEND!] : '*',
        allowedHeaders: ['Access-Control-Allow-Origin'],
        credentials: true
    },
    pingTimeout: 60000
})



io.on('connection', (socket) => {
    console.log('User Connected.')

    socket.on('message', (msg) => {
        console.log(msg)
    })


    socket.on('disconnect', () => {
        console.log('User Disconnected.')
    })
})


const port = process.env.PORT
httpServer.listen(port, () => {
    console.log(`Server PORT : ${port}`)
})