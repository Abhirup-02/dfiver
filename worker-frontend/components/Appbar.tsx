'use client'

import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import { workerSignIn } from '@/lib/apiCalls';

export default function Appbar() {

    const { publicKey, signMessage } = useWallet()

    useEffect(() => {
        async function signAndSend() {
            if (!publicKey) return

            try {
                const message = new TextEncoder().encode(`Sign into dFiver on ${new Date()}`)
                const signature = await signMessage?.(message)

                if (!signature) return

                await workerSignIn(publicKey.toString(), signature)
            }
            catch (err) {
                console.log(err)
            }
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
                    ? <WalletDisconnectButton onClick={() => sessionStorage.removeItem('token')} />
                    : <WalletMultiButton />
                }
            </div>
        </div>
    )
}