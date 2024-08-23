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

        if (res.status == 200) {
            return data.task
        }
        if (res.status == 411) {
            return data.message
        }
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

        return {
            pendingAmount: data.pendingAmount,
            processingAmount: data.processingAmount
        }
    }
    catch (err) {
        console.error(err)
    }
}


export async function payout() {
    try {
        const res = await fetch(`${API_URL}/payout`, {
            method: 'POST',
            credentials: 'include'
        })

        const data = await res.json()

        console.log(data)
    }
    catch (err) {
        console.error(err)
    }
}

