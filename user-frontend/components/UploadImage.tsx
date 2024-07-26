'use client'
import { getPresignedURL } from "@/lib/apiCalls";
import Image from "next/image";
import { useState } from "react"
import Loader from "./Loader";

export default function UploadImage({ onImageAdded, image }: { onImageAdded: (image: string) => void; image?: string; }) {
    const [uploading, setUploading] = useState(true)

    async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {

        if (!e.target.files) return

        setUploading(true)
        try {
            const file: File = e.target.files[0]
            const filename = file.name + '_' + new Date().getTime().toString()

            const presignedURL = await getPresignedURL(filename)

            await fetch(presignedURL, {
                method: 'PUT',
                body: file
            })

            // Show the local images which I have chosen, how to show the images using a CDN??
            // onImageAdded(`${CLOUDFRONT_URL}/${response.data.fields["key"]}`);
        } catch (err) {
            console.error(err)
        }
        setUploading(false)
    }

    if (image) {
        return <Image className={"p-2 w-96 rounded"} src={image} alt="task-image" />
    }

    return (
        <div className="w-40 h-40 rounded border text-2xl cursor-pointer">
            <div className="h-full flex justify-center flex-col relative w-full">
                <div className="h-full flex justify-center w-full pt-16 text-4xl">
                    {uploading
                        ? <Loader bgHeight="40vh" height="4rem" width="4rem" color="#FAF9F6" />
                        : <input className="w-full h-full" type="file" accept="*" onChange={onFileSelect} />
                    }
                </div>
            </div>
        </div>
    )
}