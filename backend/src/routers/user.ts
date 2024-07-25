import { Router } from "express";
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { bucketName, minioClient } from "../lib/store";
import { authMiddleware } from "../middleware";
import { createTaskInput } from "../types";

const JWT_SECRET = process.env.JWT_SECRET!
const DEFAULT_TITLE = "Select the most clickable thumbnail"

const router = Router()
const prismaClient = new PrismaClient()


router.get('/task', authMiddleware, async (req, res) => {
    //@ts-ignore
    const userID: string = req.userID
    //@ts-ignore
    const taskID: string = req.query.taskID

    const taskDetails = await prismaClient.task.findFirst({
        where: {
            user_id: Number(userID),
            id: Number(taskID)
        },
        include: {
            options: true
        }
    })

    if (!taskDetails) {
        return res.status(411).json({
            message: "You don't have access to this task"
        })
    }

    const responses = await prismaClient.submission.findMany({
        where: {
            task_id: Number(taskID)
        },
        include: {
            option: true
        }
    })

    const result: Record<string, {
        count: number,
        option: {
            imageURL: string
        }
    }> = {}

    taskDetails.options.forEach(option => {
        result[option.id] = {
            count: 0,
            option: {
                imageURL: option.image_url
            }
        }
    })

    responses.forEach(r => {
        result[r.option_id].count++
    })

    res.json({ result })
})

router.post('/task', authMiddleware, async (req, res) => {
    //@ts-ignore
    const userID = req.userID
    const body = req.body
    const parseData = createTaskInput.safeParse(body)

    if (!parseData.success) {
        return res.status(411).json({
            message: "You've sent wrong inputs"
        })
    }

    //parse the signature here to ensure the person has paid

    try {
        const response = await prismaClient.$transaction(async (tx) => {

            const response = await prismaClient.task.create({
                data: {
                    title: parseData.data.title ?? DEFAULT_TITLE,
                    signature: parseData.data.signature,
                    amount: "1",
                    user_id: userID
                }
            })

            await tx.option.createMany({
                data: parseData.data.options.map(x => ({
                    image_url: x.imageURL,
                    task_id: response.id
                }))
            })

            return response
        })

        res.json({
            id: response.id
        })
    }
    catch (err) {
        console.log(err);
    }
})

router.get('/presignedUrl', authMiddleware, async (req, res) => {
    //@ts-ignore
    const userID = req.userID
    const objectName = `${userID}/IPFS.jpg`

    try {
        const presignedURL = await minioClient.presignedPutObject(bucketName, objectName, 24 * 60 * 60)

        console.log(presignedURL);

        res.json({ presignedURL })
    }
    catch (err) {
        console.log(err);
    }
})

router.post('/signin', async (req, res) => {
    const walletAddress = "9uXGPXSvJFy7hB6KgniQ99yWvmveTJ4rNDyXHb6U7E8P"

    try {
        const existingUser = await prismaClient.user.findFirst({
            where: {
                address: walletAddress
            }
        })

        if (existingUser) {
            const token = jwt.sign({
                userID: existingUser.id
            },
                JWT_SECRET,
                { expiresIn: '1d' }
            )

            return res.json({ token })
        }
        else {
            const user = await prismaClient.user.create({
                data: {
                    address: walletAddress
                }
            })

            const token = jwt.sign({
                userID: user.id
            },
                JWT_SECRET,
                { expiresIn: '1d' }
            )

            return res.json({ token })
        }
    }
    catch (err) {
        console.log(err);
    }
})

export default router