const API_URL = process.env.NEXT_PUBLIC_API_URL as string

export async function workerSignIn(publicKey: string, signature: Uint8Array) {
    try {
        const res = await fetch(`${API_URL}/signin`, {
            method: 'POST',
            body: JSON.stringify({
                publicKey,
                signature
            }),
            headers: {
                'Content-Type': 'application/json'
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


export async function nextTask() {
    try {
        const res = await fetch(`${API_URL}/next-task`, {
            credentials: 'include'
        })

        const data = await res.json()

        return data.task
    }
    catch (err) {
        console.error(err)
    }
}


export async function submission(taskID: number, selection: number) {
    try {
        const res = await fetch(`${API_URL}/submission`, {
            method: 'POST',
            body: JSON.stringify({
                taskID,
                selection
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })

        const data = await res.json()

        return data
    }
    catch (err) {
        console.error(err)
    }
}


export async function getBalance() {
    try {
        const res = await fetch(`${API_URL}/balance`, {
            credentials: 'include'
        })

        const data = await res.json()

        return data.pendingAmount
    }
    catch (err) {
        console.error(err)
    }
}



