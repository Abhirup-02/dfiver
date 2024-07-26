'use client'
import { getTaskDetails } from '@/lib/apiCalls';
import Image from 'next/image';
import { useEffect, useState } from 'react'

export default function TaskPage({ params: { taskID } }: { params: { taskID: string } }) {

    const [result, setResult] = useState<Record<string, {
        count: number;
        option: {
            imageURL: string
        }
    }>>({})

    const [taskDetails, setTaskDetails] = useState<{ title?: string }>({})

    // useEffect(() => {
    //     getTaskDetails(taskID)
    //         .then((data) => {
    //             setResult(data.result)
    //             setTaskDetails(data.taskDetails)
    //         })
    // }, [taskID])

    return (
        <div>
            {/* <div className='text-2xl pt-20 flex justify-center'>
                {taskDetails.title}
            </div>
            <div className='flex justify-center pt-8'>
                {Object.keys(result || {}).map(taskId => <Task imageURL={result[taskId].option.imageURL} votes={result[taskId].count} />)}
            </div> */}
        </div>
    )
}

function Task({ imageURL, votes }: { imageURL: string; votes: number; }) {
    return (
        <>
            <Image className={"p-2 w-96 rounded-md"} src={imageURL} alt='task-image' />
            <div className='flex justify-center'>
                {votes}
            </div>
        </>
    )
}