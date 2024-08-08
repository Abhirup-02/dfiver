'use client'
import { getPresignedURL } from "@/lib/apiCalls";
import Image from "next/image";
import { useState } from "react"
import Loader from "./Loader";
import { rgbDataURL } from "@/lib/blurryImage";

export default function UploadImage({ onImageAdded, image }: { onImageAdded: (image: string) => void; image?: string; }) {
    const [uploading, setUploading] = useState(false)

    async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {

        if (!e.target.files) return

        setUploading(true)
        try {
            const file: File = e.target.files[0]
            const filename = file.name + '_' + new Date().getTime().toString()

            const { userID, presignedURL } = await getPresignedURL(filename)

            new Promise(async (resolve, reject) => {
                await fetch(presignedURL, {
                    method: 'PUT',
                    body: file
                })

                resolve(onImageAdded(`${process.env.NEXT_PUBLIC_API_URL}/get-object?userID=${userID}&filename=${filename}`))
            })
        }
        catch (err) {
            console.error(err)
        }
        setUploading(false)
    }

    if (image) {
        return (
            <Image
                className="rounded"
                src={image}
                width={300}
                height={200}
                alt="task-image"
                placeholder="blur"
                blurDataURL={rgbDataURL(128, 128, 128)}
                unoptimized
            />
        )
    }

    return (
        <div className="w-48 h-48 rounded-lg border-2 border-red-800 bg-gray-300">
            {uploading
                ? <Loader bgHeight="100%" height="2rem" width="2rem" color="#010101" />
                : <div className="h-full">
                    <label htmlFor="image_file" className="flex flex-col h-full justify-center items-center cursor-pointer">
                        <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                        </svg>
                        <span className="text-black">Select Image</span>
                        <input type="file" id="image_file" className="opacity-0 cursor-pointer" accept="image/*" onChange={onFileSelect} />
                    </label>
                </div>
            }
        </div>
    )
}