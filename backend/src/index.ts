import express from 'express'
import userRouter from './routers/user'
import workerRouter from './routers/worker'
import cors from 'cors'
import morgan from 'morgan'

process.loadEnvFile()

const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))

app.use('/v1/user', userRouter)
app.use('/v1/worker', workerRouter)

const port = 8000
app.listen(port, () => {
    console.log(`Server PORT : ${port}`)
})