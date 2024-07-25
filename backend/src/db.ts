import { PrismaClient } from "@prisma/client"

const prismaClient = new PrismaClient()

export const getNextTask = async (workerID: number) => {
    const task = await prismaClient.task.findFirst({
        where: {
            done: false,
            submissions: {
                none: {
                    worker_id: workerID,
                }
            }
        },
        select: {
            id: true,
            amount: true,
            title: true,
            options: true
        }
    })

    return task
}