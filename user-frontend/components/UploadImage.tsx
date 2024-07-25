'use client'

export default function UplaodImage() {
    return (
        <div className="w-40 h-40 rounded border text-2xl cursor">
            <div className="h-full flex justify-center flex-col">
                <div className="w-full flex justify-center">
                    <input type="file" accept="image/*" className=""  />
                </div>
            </div>
        </div>
    )
}