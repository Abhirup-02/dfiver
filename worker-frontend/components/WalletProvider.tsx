'use client'

import React, { useMemo } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"

require("@solana/wallet-adapter-react-ui/styles.css")


export default function AppWalletProvider({ children }: { children: React.ReactNode }) {
    const network = WalletAdapterNetwork.Devnet

    const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL as string

    const wallets = useMemo(
        () => [],
        [network]
    )

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}