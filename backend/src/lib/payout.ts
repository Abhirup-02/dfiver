import bs58 from "bs58"
import { Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { connection, PARENT_WALLET_ADDRESS, PARENT_WALLET_PRIVATE_KEY, TOTAL_DECIMALS } from "../config";

interface Payload {
    to: string;
    amount: number;
}

export async function processPayout({ to, amount }: Payload) {

    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(PARENT_WALLET_ADDRESS),
                toPubkey: new PublicKey(to),
                lamports: LAMPORTS_PER_SOL * (amount / TOTAL_DECIMALS)
            })
        )

        const keypair = Keypair.fromSecretKey(bs58.decode(PARENT_WALLET_PRIVATE_KEY))

        const signature = await sendAndConfirmTransaction(connection, transaction, [keypair])

        return signature
    }
    catch (err) {
        console.log(err)
    }
}
