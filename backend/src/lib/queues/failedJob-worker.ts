import { PrismaClient } from "@prisma/client";
import { processPayout } from "../payout";
import { Worker } from "bullmq";
import { redisConnection } from "../../config";


const prismaClient = new PrismaClient()


interface PayoutJob {
    payout_id: number;
    to: string;
    amount: number;
}


export const failedPayoutWorker = new Worker('failed_payouts', async (job) => {
    const data: PayoutJob = job.data
    console.log('Failed-Job Received.. ', job.id)

    const signature = await processPayout({
        to: data.to,
        amount: data.amount
    })

    const worker = await prismaClient.worker.findUnique({
        where: {
            address: data.to
        }
    })

    if (!worker) throw new Error("Worker not found")


    if (!signature) {
        // they can be checked later manually by person
        await prismaClient.$transaction(async (tx) => {
            await tx.balance.update({
                where: {
                    worker_id: worker.id
                },
                data: {
                    pending_amount: {
                        increment: data.amount
                    },
                    processing_amount: {
                        decrement: data.amount
                    }
                }
            })

            await tx.payouts.update({
                where: {
                    id: data.payout_id
                },
                data: {
                    status: 'Failure'
                }
            })
        })

        await job.moveToFailed(new Error('Payout to worker failed in DLQ'), 'Payout to worker failed', true)
    }
    else {
        await prismaClient.$transaction(async (tx) => {
            await tx.balance.update({
                where: {
                    worker_id: worker.id
                },
                data: {
                    processing_amount: {
                        decrement: data.amount
                    },
                    locked_amount: {
                        increment: data.amount
                    }
                }
            })


            await tx.payouts.update({
                where: {
                    id: data.payout_id
                },
                data: {
                    signature,
                    status: 'Success'
                }
            })
        })

        return 'Payment Successful'
    }

}, {
    connection: redisConnection,
    limiter: {
        max: 2,
        duration: 10 * 1000
    }
})
