import bs58 from "bs58"
import { Worker } from "bullmq"
import { Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js"
import { connection, LAMPORT, PARENT_WALLET_ADDRESS, PARENT_WALLET_PRIVATE_KEY, TOTAL_DECIMALS } from "../../config";
import { PrismaClient } from "@prisma/client";


const prismaClient = new PrismaClient()


interface payload {
    to: string;
    amount: number;
}


async function processPayout({ to, amount }: payload) {

    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(PARENT_WALLET_ADDRESS),
                toPubkey: new PublicKey(to),
                lamports: LAMPORT * (amount / TOTAL_DECIMALS)
            })
        )

        const keypair = Keypair.fromSecretKey(bs58.decode(PARENT_WALLET_PRIVATE_KEY))

        const signature = await sendAndConfirmTransaction(connection, transaction, [keypair])

        return signature
    }
    catch (err) {
        console.log(err)
    }
}


export const payoutWorker = new Worker('payouts', async (job) => {
    const data = job.data
    console.log('Job Received.. ', job.id)

    const signature = await processPayout({
        to: data.to,
        amount: data.amount
    })

    if (!signature) {
        await prismaClient.payouts.update({
            where: {
                id: data.payout_id
            },
            data: {
                status: 'Failure'
            }
        })
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
    }

}, {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT!),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD
    },
    limiter: {
        max: 4,
        duration: 10 * 1000
    }
})
