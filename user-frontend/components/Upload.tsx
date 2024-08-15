'use client'
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import UploadImage from "@/components/UploadImage";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { createTask } from '@/lib/apiCalls';
import Loader from './Loader';

export default function Upload() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [images, setImages] = useState<Array<string>>([])
    const [txnSignature, setTxnSignature] = useState<string>()

    const [loading, setLoading] = useState(false)

    const { connection } = useConnection()
    const { publicKey, sendTransaction } = useWallet()


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const taskID = await createTask(images, title, txnSignature!)
        setLoading(false)
        router.push(`/tasks/${taskID}`)
    }


    async function makePayment(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey!,
                    toPubkey: new PublicKey(process.env.NEXT_PUBLIC_PARENT_WALLET_ADDRESS!),
                    lamports: LAMPORTS_PER_SOL / 10
                })
            )

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight }
            } = await connection.getLatestBlockhashAndContext()

            const signature = await sendTransaction(transaction, connection, { minContextSlot })

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature })

            setTxnSignature(signature)
        }
        catch (err) {
            console.log(err)
        }
        setLoading(false)
    }



    return (
        <div className='flex justify-center'>
            <form onSubmit={txnSignature ? handleSubmit : makePayment} className="max-w-screen-lg w-full py-14 px-18 flex flex-col">

                <span className="text-2xl">Create a task</span>

                <div className="flex flex-col gap-2 my-5">
                    <label htmlFor="task" className="text-md font-medium">Task details</label>
                    <input
                        onChange={(e) => setTitle(e.target.value)}
                        id="task"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="What is your task?"
                        required
                    />
                </div>

                <span className="text-md font-medium mb-4 text-center">Add Images</span>

                <div className="flex gap-4 flex-wrap px-10">
                    {images.map((image, idx) =>
                        <UploadImage
                            key={idx}
                            image={image}
                            onImageAdded={(imageUrl) => setImages((prev) => [...prev, imageUrl])}
                        />
                    )}
                </div>

                <div className="flex flex-col items-center gap-4 mt-10">
                    <UploadImage onImageAdded={(imageUrl) => {
                        setImages((prev) => [...prev, imageUrl])
                    }} />

                    <button
                        type="submit"
                        className="w-32 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-xl text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    >
                        {txnSignature ? (
                            loading ? <Loader bgHeight='1.2rem' width='1.2rem' height='1.2rem' color='' /> : 'Submit Task'
                        ) : (
                            loading ? <Loader bgHeight='1.2rem' width='1.2rem' height='1.2rem' color='' /> : 'Pay 0.1 SOL'
                        )}
                    </button>
                </div>

            </form>
        </div>
    )
}
