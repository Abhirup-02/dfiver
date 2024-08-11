const API_URL = process.env.NEXT_PUBLIC_API_URL as string

export async function userSignIn(publicKey: string, signature: Uint8Array) {
    try {
        const res = await fetch(`${API_URL}/signin`, {
            method: 'POST',
            body: JSON.stringify({
                publicKey,
                signature
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        })

        const data = await res.json()

        sessionStorage.setItem('logged', data.message)
    }
    catch (err) {
        console.error(err)
    }
}


export async function logout() {
    try {
        const res = await fetch(`${API_URL}/logout`, {            
            credentials: 'include'
        })

        const data = await res.json()

        return data.message
    }
    catch (err) {
        console.error(err)
    }
}


export async function getPresignedURL(filename: string) {
    try {
        const res = await fetch(`${API_URL}/presignedUrl?filename=${filename}`, {
            credentials: 'include'
        })

        const data = await res.json()

        return data
    }
    catch (err) {
        console.error(err)
    }
}


export async function createTask(images: Array<string>, title: string, txnSignature: string) {

    const options = images.map((image) => ({
        imageURL: image
    }))

    try {
        const res = await fetch(`${API_URL}/task`, {
            method: 'POST',
            body: JSON.stringify({
                options,
                title,
                signature: txnSignature
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })

        const data = await res.json()

        return data.id
    }
    catch (err) {
        console.error(err)
    }
}


export async function getAllTasks() {
    try {
        const res = await fetch(`${API_URL}/all-tasks`, {
            credentials: 'include'
        })

        const data = await res.json()

        return data.tasks
    }
    catch (err) {
        console.error(err)
    }
}


export async function getTaskDetails(taskID: string) {
    try {
        const res = await fetch(`${API_URL}/task?taskID=${taskID}`, {
            credentials: 'include'
        })

        const data = await res.json()

        return data
    }
    catch (err) {
        console.error(err)
    }
}
