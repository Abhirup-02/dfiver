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

    if (!signature) {
        // they can be checked later manually by person
        await prismaClient.payouts.update({
            where: {
                id: data.payout_id
            },
            data: {
                status: 'Failure'
            }
        })

        await job.moveToFailed(new Error('Payout to worker failed in DLQ'), 'Payout to worker failed', true)
    }
    else {
        await prismaClient.payouts.update({
            where: {
                id: data.payout_id
            },
            data: {
                signature,
                status: 'Success'
            }
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