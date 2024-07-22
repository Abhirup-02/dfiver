import { Client } from 'minio';

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESSKEY!,
    secretKey: process.env.MINIO_SECRETKEY!,
})

const bucketName = process.env.MINIO_BUCKET_NAME!;

export { minioClient, bucketName };