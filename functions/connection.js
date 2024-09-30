import {
  TOKEN_PROGRAM_ID,
  createTransferCheckedInstruction,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import fs from "fs";
import path from "path";
import {
  KHMER_TOKEN_ADDRESS,
  KHMER_TOKEN_TRANSFER_COMPUTE_UNITS,
  TOKEN_TRANSFER_COMPUTE_UNIT_MICRO_LAMPORTS,
} from "./configs/constant.js";

export class SolanaConnection {
  constructor() {
    this.connection = new Connection(
      "https://bitter-flashy-flower.solana-mainnet.quiknode.pro/edd5eaa8a02c4453a929931697a3a7ad66eaa3fd/",
      "finalized"
    );
  }

  loadWallet(filePathOrBs58) {
    try {
      const secretKey = JSON.parse(fs.readFileSync(path.join(filePathOrBs58), { encoding: "utf-8" }));
      return Keypair.fromSecretKey(new Uint8Array(secretKey));
    } catch (error) {
      console.error("Failed to load wallet from JSON file. ", error);
      console.log("Trying with private key...");
      try {
        return Keypair.fromSecretKey(new Uint8Array(bs58.decode(filePathOrBs58)));
      } catch (error) {
        console.error("Failed to load wallet.");
        return null;
      }
    }
  }

  async getBalance(publicKey) {
    try {
      return await this.connection.getBalance(new PublicKey(publicKey));
    } catch (error) {
      console.error("Failed to get balance. ", error);
      return null;
    }
  }

  async getOrCreateTokenAccount(wallet, tokenAddress) {
    return await getOrCreateAssociatedTokenAccount(
      this.connection,
      wallet,
      new PublicKey(tokenAddress),
      wallet.publicKey
    );
  }

  async transferTokenFee(payer, payee) {
    let blockhash = await this.connection.getLatestBlockhash();
    let minimumLamports = await this.connection.getMinimumBalanceForRentExemption(0);
    const instructions = [
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: payee.publicKey,
        lamports: BigInt(minimumLamports),
      }),
    ];
    const messageV0 = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: blockhash.blockhash,
      instructions,
    }).compileToV0Message();
    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([payer]);

    const signature = await this.connection.sendTransaction(transaction);
    console.log(` 🎉 Signature: https://solscan.io/tx/${signature}`);
    await this.connection.confirmTransaction(
      {
        signature: signature,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
      },
      "finalized"
    );
    console.log(" ✅ Transaction Finalized.");

    return signature;
  }

  async transferKHMER(payer, payerTokenAccountAddress, payeeTokenAccountAddress, lamports) {
    let blockhash = await this.connection.getLatestBlockhash();
    const instructions = [
      createTransferCheckedInstruction(
        payerTokenAccountAddress,
        new PublicKey(KHMER_TOKEN_ADDRESS),
        payeeTokenAccountAddress,
        payer.publicKey,
        BigInt(lamports),
        Math.round(Math.log(LAMPORTS_PER_SOL) / Math.log(10)),
        undefined,
        TOKEN_PROGRAM_ID
      ),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: TOKEN_TRANSFER_COMPUTE_UNIT_MICRO_LAMPORTS }),
      ComputeBudgetProgram.setComputeUnitLimit({ units: KHMER_TOKEN_TRANSFER_COMPUTE_UNITS }),
    ];
    const messageV0 = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: blockhash.blockhash,
      instructions,
    }).compileToV0Message();
    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([payer]);

    const signature = await this.connection.sendTransaction(transaction);
    console.log(` 🎉 Signature: https://solscan.io/tx/${signature}`);
    await this.connection.confirmTransaction(
      {
        signature: signature,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
      },
      "confirmed"
    );
    console.log(" ✅ Transaction Completed.");

    return signature;
  }
}
