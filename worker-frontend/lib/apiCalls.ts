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