import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from 'jsonwebtoken'
import { workerAuthMiddleware } from "../middleware";
import { getNextTask } from "../db";
import { createSubmissionInput } from "../types";
import { TOTAL_SUBMISSIONS } from "../config";

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
            pendingAmount: workerBalance.pending_amount,
            lockedAmount: workerBalance.locked_amount
        })
    }
})

router.post('/payout', workerAuthMiddleware, async (req, res) => {
    //@ts-ignore
    const workerID = req.workerID

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

    const address = worker.address
    const txnID = '0x682764876284'
    // new Transaction on solana @solana/web3.js
    // new Transaction(from, to)


    // Lock the specific balance row corresponds to worker
    await prismaClient.$transaction(async (tx) => {
        await tx.balance.update({
            where: {
                worker_id: workerID
            },
            data: {
                pending_amount: {
                    decrement: worker.balance?.pending_amount
                },
                locked_amount: {
                    increment: worker.balance?.pending_amount
                }
            }
        })

        await tx.payouts.create({
            data: {
                user_id: workerID,
                amount: worker.balance?.pending_amount!,
                status: 'Processing',
                signature: txnID
            }
        })
    })

    //send txn to solana blockchain

    res.json({
        message: "Processing Payout",
        amount: worker.balance?.pending_amount
    })
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

    if (!task) {
        res.status(411).json({
            message: 'NO more tasks left for you to review'
        })
    }
    else {
        res.json({ task })
    }
})

router.post('/signin', async (req, res) => {
    const { publicKey, signature } = req.body

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

            return res.json({ token })
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

            return res.json({ token })
        }
    }
    catch (err) {
        console.log(err);
    }
})

export default router