import { Router } from "express";
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { bucketName, minioClient } from "../lib/store";
import { authMiddleware } from "../middleware";

const JWT_SECRET = process.env.JWT_SECRET!

const router = Router()

const prismaClient = new PrismaClient()

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