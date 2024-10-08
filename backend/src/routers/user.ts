import jwt from 'jsonwebtoken'
import nacl from 'tweetnacl'
import { PublicKey } from "@solana/web3.js";
import { Router } from "express";
import { PrismaClient } from '@prisma/client'
import { bucketName, minioClient } from "../lib/store";
import { userAuthMiddleware } from "../middleware";
import { createTaskInput } from "../types";
import { connection, PARENT_WALLET_ADDRESS, TOTAL_DECIMALS } from "../config";

const USER_JWT_SECRET = process.env.USER_JWT_SECRET!

declare const DEFAULT_TITLE = "Select the most clickable thumbnail"

const router = Router()
const prismaClient = new PrismaClient()



router.get('/all-tasks', userAuthMiddleware, async (req, res) => {
    //@ts-ignore
    const userID: string = req.userID

    const tasks = await prismaClient.task.findMany({
        where: {
            user_id: Number(userID),
        },
        select: {
            id: true,
            title: true,
            amount: true,
            done: true
        }
    })

    if (tasks) tasks.forEach(task => task.amount = task.amount / TOTAL_DECIMALS)

    if (!tasks) {
        return res.status(411).json({
            message: "You don't have access to this task"
        })
    }

    res.json({ tasks })
})


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



    try {
        const user = await prismaClient.user.findFirst({
            where: {
                id: userID
            }
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        else {
            const transaction = await connection.getTransaction(parseData.data.signature, {
                maxSupportedTransactionVersion: 1
            })

            if (transaction && transaction.meta && transaction.transaction) {

                if ((transaction.meta.postBalances[1] ?? 0) - (transaction.meta.preBalances[1] ?? 0) !== 0.1 * TOTAL_DECIMALS) {
                    return res.status(411).json({
                        message: 'Transaction amount incorrect'
                    })
                }

                if (transaction.transaction.message.getAccountKeys().get(1)?.toString() !== PARENT_WALLET_ADDRESS) {
                    return res.status(411).json({
                        message: 'Transaction sent to wrong address'
                    })
                }

                if (transaction.transaction.message.getAccountKeys().get(0)?.toString() !== user.address) {
                    return res.status(411).json({
                        message: 'Transaction came from wrong address'
                    })
                }
                // const transaction = Transaction.from(parseData.data.signature);
            }
            else {
                console.log('Transaction is not valid');
            }
        }

    }
    catch (err) {
        console.log(err)
    }




    try {
        const response = await prismaClient.$transaction(async (tx) => {

            const response = await tx.task.create({
                data: {
                    title: parseData.data.title ?? DEFAULT_TITLE,
                    signature: parseData.data.signature,
                    amount: 0.1 * TOTAL_DECIMALS,
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

    const message = new TextEncoder().encode(`Sign into dFiver on ${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()}`)

    const result = nacl.sign.detached.verify(
        message,
        new Uint8Array(signature.data),
        new PublicKey(publicKey).toBytes()
    )

    if (!result) {
        return res.status(411).json({
            message: 'Incorrect signature'
        })
    }


    try {
        const existingUser = await prismaClient.user.findFirst({
            where: {
                address: publicKey
            }
        })

        if (existingUser) {
            const token = jwt.sign({
                userID: existingUser.id
            },
                USER_JWT_SECRET,
                { expiresIn: '1d' }
            )

            req.session!.dFiver = token
            res.json({ message: 'Logged In' })
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

            req.session!.dFiver = token
            res.json({ message: 'Logged In' })
        }
    }
    catch (err) {
        console.log(err)
    }
})

router.get('/logout', async (req, res) => {
    req.session = null
    res.json({ message: 'Logged Out' })
})

export default router