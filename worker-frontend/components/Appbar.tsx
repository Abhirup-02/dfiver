'use client'

import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { getBalance, logout, payout, workerSignIn } from '@/lib/apiCalls';

export default function Appbar() {

    const { publicKey, signMessage } = useWallet()
    const [balance, setBalance] = useState(0)

    useEffect(() => {
        async function signAndSend() {
            if (sessionStorage.getItem('logged')) return
            if (!publicKey) return

            try {
                const message = new TextEncoder().encode(`Sign into dFiver as a worker on ${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()}`)
                const signature = await signMessage?.(message)
                
                if (!signature) return

                await workerSignIn(publicKey!.toString(), signature)
            }
            catch (err) {
                console.log(err)
            }
        }

        async function pendingAmount() {
            const amount = await getBalance()
            setBalance(amount)
        }

        publicKey && signAndSend()
        publicKey && pendingAmount()
    }, [publicKey])

    return (
        <div className="flex justify-between items-center px-8 py-4 border-b">
            <div className="text-2xl">
                dFiver
            </div>
            <div className="flex gap-4 items-center">
                {publicKey &&
                    <button
                        className="h-[60%] bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                        onClick={payout}
                    >
                        Pay me out ({balance}) SOL
                    </button>
                }

                {publicKey
                    ? <WalletDisconnectButton onClick={async () => {
                        await logout()
                        sessionStorage.removeItem('logged')
                    }} />
                    : <WalletMultiButton />
                }
            </div>
        </div>
    )
}