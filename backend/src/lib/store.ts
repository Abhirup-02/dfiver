import { Client } from 'minio';
import { Queue } from 'bullmq'

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESSKEY!,
    secretKey: process.env.MINIO_SECRETKEY!,
})

const bucketName = process.env.MINIO_BUCKET_NAME!;



export const payoutQueue = new Queue('payouts', {
    connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT!),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD
    }
})



export { minioClient, bucketName };