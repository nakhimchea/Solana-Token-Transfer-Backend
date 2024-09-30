import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { KHMER_TOKEN_ADDRESS } from "./functions/configs/constant.js";
import { SolanaConnection } from "./functions/connection.js";

async function main() {
  console.log("====================================== START PROGRAM ======================================");
  const solanaConnection = new SolanaConnection();
  console.log(`Lamports per SOL: ${LAMPORTS_PER_SOL}`);
  console.log("======================================= LOAD WALLET =======================================");
  const payer = solanaConnection.loadWallet("./pks/tomorrow.json");
  const payee = solanaConnection.loadWallet("./pks/receiver.json");
  console.log(`Payer Account: ${payer.publicKey}`);
  console.log(`Payee Account: ${payee.publicKey}`);
  console.log(" ✅ Wallet Account Loading Successfully.");
  const amount = 1000000;

  try {
    console.log("======================================= GET BALANCE =======================================");
    const payerBalance = await solanaConnection.getBalance(payer.publicKey);
    const payeeBalance = await solanaConnection.getBalance(payee.publicKey);
    console.log(`Payer Balance: ${payerBalance}`);
    console.log(`Payee Balance: ${payeeBalance}`);

    console.log("=============================== GET OR CREATE TOKEN ACCOUNT ===============================");
    const payerTokenAccount = await solanaConnection.getOrCreateTokenAccount(payer, KHMER_TOKEN_ADDRESS);
    const payeeTokenAccount = await solanaConnection.getOrCreateTokenAccount(payee, KHMER_TOKEN_ADDRESS);
    console.log(`Payer Token Account: ${payerTokenAccount.address}`);
    console.log(`Payee Token Account: ${payeeTokenAccount.address}`);

    // console.log("==================================== TRANSFER TOKEN FEE ===================================");
    // const solanaTransferStart = Date.now();
    // await solanaConnection.transferTokenFee(payer, payee);
    // console.log(` ✅ Fee Transfer: ${Date.now() - solanaTransferStart} ms`);

    console.log("====================================== TRANSFER TOKEN =====================================");
    const tokenTransferStart = Date.now();
    await solanaConnection.transferKHMER(
      payer,
      payerTokenAccount.address,
      payeeTokenAccount.address,
      amount * LAMPORTS_PER_SOL
    );
    console.log(` ✅ Token Transfer: ${Date.now() - tokenTransferStart} ms`);
    console.log("===========================================================================================");
  } catch (error) {
    console.log(`   ❌ Transaction: Not Confirmed. Retry... ${error}`);

    // console.log("==================================== TRANSFER TOKEN FEE ===================================");
    // const solanaTransferStart = Date.now();
    // await solanaConnection.transferTokenFee(payer, payee);
    // console.log(` ✅ Fee Transfer: ${Date.now() - solanaTransferStart} ms`);

    console.log("======================================= GET BALANCE =======================================");
    const payerBalance = await solanaConnection.getBalance(payer.publicKey);
    const payeeBalance = await solanaConnection.getBalance(payee.publicKey);
    console.log(`Payer Balance: ${payerBalance}`);
    console.log(`Payee Balance: ${payeeBalance}`);

    console.log("=============================== GET OR CREATE TOKEN ACCOUNT ===============================");
    const payerTokenAccount = await solanaConnection.getOrCreateTokenAccount(payer, KHMER_TOKEN_ADDRESS);
    const payeeTokenAccount = await solanaConnection.getOrCreateTokenAccount(payee, KHMER_TOKEN_ADDRESS);
    console.log(`Payer Token Account: ${payerTokenAccount.address}`);
    console.log(`Payee Token Account: ${payeeTokenAccount.address}`);

    console.log("====================================== TRANSFER TOKEN =====================================");
    const tokenTransferStart = Date.now();
    await solanaConnection.transferKHMER(
      payer,
      payerTokenAccount.address,
      payeeTokenAccount.address,
      amount * LAMPORTS_PER_SOL
    );
    console.log(` ✅ Token Transfer: ${Date.now() - tokenTransferStart} ms`);
    console.log("===========================================================================================");
  }
}

try {
  main();
} catch (error) {
  console.log(`Error: ${error}`);
}
