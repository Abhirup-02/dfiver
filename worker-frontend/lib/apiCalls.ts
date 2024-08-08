const API_URL = process.env.NEXT_PUBLIC_API_URL as string

export async function workerSignIn(publicKey: string, signature?: any) {
    try {
        const res = await fetch(`${API_URL}/signin`, {
            method: 'POST',
            body: JSON.stringify({
                publicKey,
                signature
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await res.json()

        return data.token
    }
    catch (err) {
        console.error(err)
    }
}

export async function nextTask() {
    const token = sessionStorage.getItem("token")
    if (!token) return

    try {
        const res = await fetch(`${API_URL}/next-task`, {
            headers: {
                'Authorization': token
            }
        })

        const data = await res.json()

        return data.task
    }
    catch (err) {
        console.error(err)
    }
}

export async function submission(taskID: number, selection: number) {
    const token = sessionStorage.getItem("token")
    if (!token) return

    try {
        const res = await fetch(`${API_URL}/submission`, {
            method: 'POST',
            body: JSON.stringify({
                taskID,
                selection
            }),
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        })

        const data = await res.json()

        return data
    }
    catch (err) {
        console.error(err)
    }
}

export async function balance() {
    const token = sessionStorage.getItem("token")
    if (!token) return

    try {
        const res = await fetch(`${API_URL}/balance`, {
            headers: {
                'Authorization': token
            }
        })

        const data = await res.json()

        return data
    }
    catch (err) {
        console.error(err)
    }
}