'use client'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import UploadImage from "@/components/UploadImage";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { createTask } from '@/lib/apiCalls';

export default function Upload() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [images, setImages] = useState<string[]>([])
    const [txnSignature, setTxnSignature] = useState('')

    const { connection } = useConnection()
    const { publicKey, sendTransaction } = useWallet()


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        // const taskID = await createTask(images, title, txnSignature)

        // router.push(`/task/${taskID}`)
    }

    // async function makePayment() {

    //     const transaction = new Transaction().add(
    //         SystemProgram.transfer({
    //             fromPubkey: publicKey!,
    //             toPubkey: new PublicKey("2KeovpYvrgpziaDsq8nbNMP4mc48VNBVXb5arbqrg9Cq"),
    //             lamports: 100000000,
    //         })
    //     );

    //     const {
    //         context: { slot: minContextSlot },
    //         value: { blockhash, lastValidBlockHeight }
    //     } = await connection.getLatestBlockhashAndContext();

    //     const signature = await sendTransaction(transaction, connection, { minContextSlot });

    //     await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
    //     setTxnSignature(signature);
    // }

    return (
        <div className="flex justify-center">
            <form onSubmit={handleSubmit} className="max-w-screen-lg w-full">
                <div className="text-2xl text-left pt-20 w-full pl-4">
                    Create a task
                </div>

                <label className="pl-4 block mt-2 text-md font-medium">Task details</label>

                <input
                    onChange={(e) => setTitle(e.target.value)}
                    id="first_name"
                    className="ml-4 mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="What is your task?"
                    required
                />

                <label className="pl-4 block mt-8 text-md font-medium">Add Images</label>
                <div className="flex justify-center pt-4 max-w-screen-lg">
                    {images.map(image => <UploadImage image={image} onImageAdded={(imageUrl) => {
                        setImages(prev => [...prev, imageUrl])
                    }} />)}
                </div>

                {/* <div className="flex justify-center">
                <button type="button" className="mt-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                    {txnSignature ? "Submit Task" : "Pay 0.1 SOL"}
                </button>
            </div> */}
            </form>

            <div className="ml-4 pt-2 flex justify-center">
                <UploadImage onImageAdded={(imageUrl) => {
                    setImages(prev => [...prev, imageUrl])
                }} />
            </div>

        </div>
    )
}