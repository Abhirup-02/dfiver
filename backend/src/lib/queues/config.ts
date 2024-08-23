import { Queue } from 'bullmq'
import { redisConnection } from '../../config'

export const payoutQueue = new Queue('payouts', { connection: redisConnection })

export const failedPayoutQueue = new Queue('failed_payouts', { connection: redisConnection })
