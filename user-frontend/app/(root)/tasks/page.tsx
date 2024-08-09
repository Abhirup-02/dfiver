'use client'

import Loader from "@/components/Loader"
import { getAllTasks } from "@/lib/apiCalls"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Task {
    id: number,
    title: string,
    amount: bigint,
    done: boolean
}

export default function AllTasks() {
    const router = useRouter()
    const [allTasks, setAllTasks] = useState<Task[] | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAllTasks()
            .then((data) => {
                setAllTasks(data)
                setLoading(false)
            })
            .catch((e) => {
                setLoading(false)
            })
    }, [])


    if (loading) {
        return <Loader bgHeight="80vh" height="4rem" width="4rem" color="#ffffff" />
    }
    else if (!allTasks) {
        return (
            <div className="flex justify-center items-center h-[80vh] text-2xl">
                You don't have any tasks as of now
            </div>
        )
    }

    return (
        <div className="flex flex-wrap gap-10 items-center px-16 py-14">
            {allTasks.map((task) => (
                <div
                    key={task.id}
                    className="flex flex-col gap-5 items-center rounded-xl border-2 border-white p-10 cursor-pointer transition duration-300 ease-in-out hover:bg-slate-500"
                    onClick={() => router.push(`/tasks/${task.id}`)}
                >
                    <span className='text-2xl'>
                        {task.title}
                    </span>
                    <span className=''>Amount: {task.amount}</span>
                    <span className={`${task.done ? 'bg-red-500' : 'bg-blue-400'} px-4 py-[4px] rounded-lg`}>{task.done ? 'Closed' : 'Open'}</span>
                </div>
            ))}
        </div>
    )
}