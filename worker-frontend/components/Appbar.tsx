'use client'

import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { getBalance, logout, payout, workerSignIn } from '@/lib/apiCalls';
import { RefreshCcw } from 'lucide-react';

export default function Appbar() {

    const { publicKey, signMessage } = useWallet()
    const [pendingAmount, setPendingAmount] = useState(0)
    const [processingAmount, setProcessingAmount] = useState(0)

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

        async function amount() {
            const data = await getBalance()

            if (data) {
                setPendingAmount(data.pendingAmount)
                setProcessingAmount(data.processingAmount)
            }
        }

        publicKey && signAndSend()
        publicKey && amount()
    }, [publicKey])

    return (
        <div className="flex justify-between items-center px-8 py-4 border-b">
            <div className="text-2xl">
                dFiver
            </div>
            <div className="flex gap-4 items-center">
                {(publicKey && processingAmount > 0) &&
                    <div className="flex items-center">
                        {processingAmount} SOL&nbsp;
                        <RefreshCcw className="w-3 h-3" />
                    </div>
                }
                {(publicKey && pendingAmount > 0) &&
                    <button
                        className="h-[60%] bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                        onClick={() => {
                            payout()
                            location.reload()
                        }}
                    >
                        Pay me out ({pendingAmount}) SOL
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