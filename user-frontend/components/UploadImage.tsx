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
                width={400}
                height={300}
                alt="task-image"
                placeholder="blur"
                blurDataURL={rgbDataURL(128, 128, 128)}
            />
        )
    }

    return (
        <div className="w-44 h-44 flex justify-center items-center rounded border cursor-pointer">
            {uploading
                ? <Loader height="2rem" width="2rem" color="#FAF9F6" />
                : <div className="w-full text-center">
                    <span className="text-4xl">+</span>
                    <input type="file" className="opacity-1 cursor-pointer" accept="image/*" onChange={onFileSelect} />
                </div>
            }
        </div>
    )
}