import jwt from 'jsonwebtoken'
import nacl from 'tweetnacl'
import { PublicKey } from "@solana/web3.js"
import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { workerAuthMiddleware } from "../middleware";
import { getNextTask } from "../db";
import { createSubmissionInput } from "../types";
import { TOTAL_DECIMALS, TOTAL_SUBMISSIONS } from "../config";
import { payoutQueue } from '../lib/queues/config';

const WORKER_JWT_SECRET = process.env.WORKER_JWT_SECRET!

const router = Router()
const prismaClient = new PrismaClient()

router.get('/balance', workerAuthMiddleware, async (req, res) => {
    //@ts-ignore
    const workerID = req.workerID

    const workerBalance = await prismaClient.balance.findFirst({
        where: {
            id: Number(workerID)
        }
    })

    if (!workerBalance) {
        res.json({
            message: 'Worker not found'
        })
    }
    else {
        res.json({
            pendingAmount: workerBalance.pending_amount / TOTAL_DECIMALS,
            processingAmount: workerBalance.processing_amount / TOTAL_DECIMALS,
            lockedAmount: workerBalance.locked_amount / TOTAL_DECIMALS
        })
    }
})

router.post('/payout', workerAuthMiddleware, async (req, res) => {
    //@ts-ignore
    const workerID = req.workerID

    try {
        const worker = await prismaClient.worker.findFirst({
            where: {
                id: workerID
            },
            include: {
                balance: true
            }
        })

        if (!worker) {
            return res.status(403).json({
                message: 'Worker not Found'
            })
        }



        // If transaction succeeds and then the server fails, so DB entry doesn't happen, then user owe them money again. Better approach is add the payout request to a queue and process it asynchronously
        try {
            const data = await prismaClient.$transaction(async (tx) => {
                await tx.balance.update({
                    where: {
                        worker_id: workerID
                    },
                    data: {
                        pending_amount: {
                            decrement: worker.balance?.pending_amount
                        },
                        processing_amount: {
                            increment: worker.balance?.pending_amount
                        }
                    }
                })

                const payout = await tx.payouts.create({
                    data: {
                        worker_id: workerID,
                        amount: worker.balance?.pending_amount!,
                        status: 'Processing'
                    }
                })

                return payout
            })


            await payoutQueue.add(`payout_${worker.address}`, {
                payout_id: data.id,
                to: worker.address,
                amount: worker.balance?.pending_amount
            })


            res.json({
                message: 'Your payout is processing',
                amount: `${worker.balance?.pending_amount! / TOTAL_DECIMALS} SOL`
            })
        }
        catch (err) {
            console.log(err)

            res.json({
                message: 'Something went wrong'
            })
        }
    }
    catch (err) {
        console.log(err)
    }
})

router.post('/submission', workerAuthMiddleware, async (req, res) => {
    //@ts-ignore
    const workerID = req.workerID

    const body = req.body
    const parsedBody = createSubmissionInput.safeParse(body)

    if (parsedBody.success) {
        const task = await getNextTask(Number(workerID))
        if (!task || task.id !== parsedBody.data.taskID) {
            res.status(411).json({
                message: 'Incorrect task ID'
            })
        }

        const amount = task?.amount! / TOTAL_SUBMISSIONS

        await prismaClient.$transaction(async (tx) => {

            const submission = await tx.submission.create({
                data: {
                    worker_id: workerID,
                    option_id: parsedBody.data.selection,
                    task_id: parsedBody.data.taskID,
                    amount
                }
            })

            await tx.balance.update({
                where: {
                    id: workerID
                },
                data: {
                    pending_amount: {
                        increment: amount
                    }
                }
            })

            return submission
        })

        const nextTask = await getNextTask(Number(workerID))

        res.json({
            nextTask,
            amount
        })
    }
    else {

    }
})

router.get('/next-task', workerAuthMiddleware, async (req, res) => {
    //@ts-ignore
    const workerID = req.workerID

    const task = await getNextTask(Number(workerID))

    res.json({ task })
})

router.post('/signin', async (req, res) => {
    const { publicKey, signature } = req.body

    const message = new TextEncoder().encode(`Sign into dFiver as a worker on ${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()}`)

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
        const existingWorker = await prismaClient.worker.findFirst({
            where: {
                address: publicKey
            }
        })

        if (existingWorker) {
            const token = jwt.sign({
                workerID: existingWorker.id
            },
                WORKER_JWT_SECRET,
                { expiresIn: '1d' }
            )

            req.session!.dFiver = token
            res.json({ message: 'Logged In' })
        }
        else {
            const worker = await prismaClient.$transaction(async (tx) => {

                const worker = await tx.worker.create({
                    data: {
                        address: publicKey
                    }
                })

                await tx.balance.create({
                    data: {
                        worker_id: worker.id,
                        pending_amount: 0,
                        processing_amount: 0,
                        locked_amount: 0
                    }
                })

                return worker
            })

            const token = jwt.sign({
                workerID: worker.id
            },
                WORKER_JWT_SECRET,
                { expiresIn: '1d' }
            )

            req.session!.dFiver = token
            res.json({ message: 'Logged In' })
        }
    }
    catch (err) {
        console.log(err);
    }
})

router.get('/logout', async (req, res) => {
    req.session = null
    res.json({ message: 'Logged Out' })
})

export default router