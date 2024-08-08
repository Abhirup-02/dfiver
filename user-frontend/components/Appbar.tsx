'use client'

import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import { userSignIn } from '@/lib/apiCalls';

export default function Appbar() {

    const { publicKey, signMessage } = useWallet()

    useEffect(() => {
        async function signAndSend() {
            if (!publicKey) return

            // const message = new TextEncoder().encode("Sign into dFiver")
            // const signature = await signMessage?.(message)

            const token = await userSignIn(publicKey.toString())
            sessionStorage.setItem("token", token)
        }

        signAndSend()
    }, [publicKey])

    return (
        <div className="flex justify-between items-center px-8 py-4 border-b">
            <div className="text-2xl">
                dFiver
            </div>
            <div className="">
                {publicKey
                    ? <WalletDisconnectButton />
                    : <WalletMultiButton />
                }
            </div>
        </div>
    )
}