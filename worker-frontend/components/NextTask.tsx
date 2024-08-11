'use client'

import { nextTask, submission } from "@/lib/apiCalls"
import { useEffect, useState } from "react"
import Loader from "./Loader"
import Image from "next/image"
import { rgbDataURL } from "@/lib/blurryImage"
import { useWallet } from "@solana/wallet-adapter-react"

interface Task {
    id: number,
    amount: number,
    title: string,
    options: {
        id: number,
        image_url: string,
        task_id: number
    }[]
}

export default function NextTask() {

    const { publicKey } = useWallet()

    const [currentTask, setCurrentTask] = useState<Task | null>()
    const [submitting, setSubmitting] = useState(false)


    useEffect(() => {
        nextTask()
            .then((data) => {
                setCurrentTask(data)
            })
            .catch((e) => {
                console.log(e)
            })
    }, [])


    if (!publicKey) {
        return (
            <div className="flex justify-center items-center h-[80vh] text-2xl">
                Please Login to check tasks
            </div>
        )
    }
    else if (currentTask === null) {
        return (
            <div className="flex justify-center items-center h-[80vh] text-2xl">
                Please check back later, there are no pending tasks at this moment
            </div>
        )
    }
    else if (currentTask !== null && currentTask !== undefined) {
        return (
            <>
                <span className='text-2xl pt-20 flex justify-center'>
                    {currentTask.title}
                </span>
                <div className='flex justify-center gap-6 py-8'>
                    {currentTask.options.map((option, idx) =>
                        <Option
                            key={idx}
                            imageURL={option.image_url}
                            onSelect={async () => {
                                setSubmitting(true)
                                const data = await submission(currentTask.id, option.id)

                                const nextTask = data.nextTask
                                if (nextTask) {
                                    setCurrentTask(nextTask)
                                }
                                else {
                                    setCurrentTask(null)
                                }
                                setSubmitting(false)

                                // Refresh the user balance in the appbar
                            }}
                        />)}
                </div>
                {submitting && <span className="text-xl pt-20 flex justify-center">Submitting...</span>}
            </>
        )
    }
    else {
        return <Loader bgHeight="80vh" height="4rem" width="4rem" color="#ffffff" />
    }
}

function Option({ imageURL, onSelect }: {
    imageURL: string;
    onSelect: () => void
}) {
    return (
        <div className='flex flex-col items-center gap-2'>
            <Image
                className="rounded-md cursor-pointer opacity-100 transition duration-300 ease-in-out hover:opacity-50"
                src={imageURL}
                width={400}
                height={300}
                alt='task-image'
                placeholder='blur'
                blurDataURL={rgbDataURL(128, 128, 128)}
                onClick={onSelect}
                unoptimized
            />
        </div>
    )
}