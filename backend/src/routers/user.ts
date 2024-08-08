import { Router } from "express";
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { bucketName, minioClient } from "../lib/store";
import { userAuthMiddleware } from "../middleware";
import { createTaskInput } from "../types";
import { TOTAL_DECIMALS } from "../config";

const USER_JWT_SECRET = process.env.USER_JWT_SECRET!
const DEFAULT_TITLE = "Select the most clickable thumbnail"

const router = Router()
const prismaClient = new PrismaClient()


router.get('/task', userAuthMiddleware, async (req, res) => {
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

    res.json({ taskDetails, result })
})

router.post('/task', userAuthMiddleware, async (req, res) => {
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

            const response = await tx.task.create({
                data: {
                    title: parseData.data.title ?? DEFAULT_TITLE,
                    signature: parseData.data.signature,
                    amount: 1 * TOTAL_DECIMALS,
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

router.get('/presignedUrl', userAuthMiddleware, async (req, res) => {
    //@ts-ignore
    const userID = req.userID

    const { filename } = req.query
    const objectName = `${userID}/${filename}`

    try {
        const presignedURL = await minioClient.presignedPutObject(bucketName, objectName, 1 * 60 * 60)

        res.json({ userID, presignedURL })
    }
    catch (err) {
        console.log(err)
    }
})

router.get('/get-object', async (req, res) => {
    const { userID, filename } = req.query
    const objectName = `${userID}/${filename}`

    try {
        const dataStream = await minioClient.getObject(bucketName, objectName)

        dataStream.pipe(res)
    }
    catch (err) {
        console.log(err)
    }
})

router.post('/signin', async (req, res) => {
    const { publicKey, signature } = req.body

    // verify signature

    try {
        const existingUser = await prismaClient.user.findFirst({
            where: {
                address: publicKey
            }
        })

        if (existingUser) {
            const token = jwt.sign({            // send JWT token in cookies
                userID: existingUser.id
            },
                USER_JWT_SECRET,
                { expiresIn: '1d' }
            )

            return res.json({ token })
        }
        else {
            const user = await prismaClient.user.create({
                data: {
                    address: publicKey
                }
            })

            const token = jwt.sign({
                userID: user.id
            },
                USER_JWT_SECRET,
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