'use client'

import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import { logout, userSignIn } from '@/lib/apiCalls';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Appbar() {
    const router = useRouter()
    const { publicKey, signMessage } = useWallet()

    useEffect(() => {
        async function signAndSend() {
            if (!publicKey) return

            try {
                const message = new TextEncoder().encode(`Sign into dFiver on ${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()}`)
                const signature = await signMessage?.(message)

                if (!signature) return

                await userSignIn(publicKey.toString(), signature)
            }
            catch (err) {
                console.log(err)
            }
        }

        signAndSend()
    }, [publicKey])

    return (
        <div className="flex justify-between items-center px-8 py-4 border-b">
            <span className="text-2xl">dFiver</span>
            <Link href='/tasks' prefetch={true} className="text-xl hover:text-blue-700">Tasks</Link>
            <div className="">
                {publicKey
                    ? <WalletDisconnectButton onClick={async () => {
                        await logout()
                        router.push('/')
                    }} />
                    : <WalletMultiButton />
                }
            </div>
        </div>
    )
}