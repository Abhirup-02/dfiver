import { Connection } from "@solana/web3.js"

export const TOTAL_SUBMISSIONS = 100
export const TOTAL_DECIMALS = 1000_000

export const connection = new Connection(process.env.SOLANA_RPC_URL as string)

export const PARENT_WALLET_ADDRESS = process.env.PARENT_WALLET_ADDRESS as string
export const PARENT_WALLET_PRIVATE_KEY = process.env.PARENT_WALLET_PRIVATE_KEY as string

export const redisConnection = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
}
