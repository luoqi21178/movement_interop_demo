# Project Overview

This project is a JavaScript application that interacts with the Aptos and Safe protocols. It is designed to perform a series of operations such as deploying a new Safe contract, setting up a new Move multisig account, and voting on a Safe contract.

## Dependencies

The project uses several npm packages:

- `ethers`: Ethereum wallet and utilities.
- `@safe-global/protocol-kit`: A toolkit for interacting with the Safe protocol.
- `aptos`: A library for interacting with the Aptos protocol.
- `dotenv`: A zero-dependency module that loads environment variables from a `.env` file into `process.env`.

## Key Functions

The application includes several key functions:

- `deploySafe()`: Deploys a new Safe contract.
- `setupMoveMultisigAccount(safeAddress)`: Sets up a new Move multisig account.
- `vote(safeAddress, multiAccount)`: Votes on a Safe contract.
- `checkSafeContractVoted(safeAddress, multiAccount)`: Checks if a Safe contract has voted.
- `submitTx(rawTxn)`: Submits a transaction.
- `zeroPad(multiAccount)`: Fixes the multiAccount address if size is distinct from AptosMove address size.

## Running the Application

The main function `run()` orchestrates the operations. It first deploys a new Safe contract, then sets up a new Move multisig account, and finally votes on the Safe contract.

```javascript
async function run() {
  let safeAddress = await deploySafe();
  let multiAccount = fix(await setupMoveMultisigAccount(safeAddress));
  await vote(safeAddress, multiAccount);
}
```

The application is run by calling `run().then()`.

## Environment Variables

The application uses several environment variables, which should be set in a `.env` file in the project root:

- `APTOS_RPC_ENDPOINT`: The RPC endpoint for the Aptos client.
- `MOVE_PRIVATE_KEY`: The private key of the Move owner.
- `MOVE_MULTISIG_OTHER_OWNER_ADDR`: The address of the other owner of the Move multisig account.
- `EVM_RPC_ENDPOINT`: The RPC endpoint for the EVM.
- `ETHEREUM_PRIVATE_KEY`: The private key of the EVM owner.
- `SAFE_SERVICE_API`: The API endpoint for the Safe service.
- `EVM_PRECOMPILE_CONTRACT`: The address of the EVM precompile contract.
- `MOVE_FRAMEWORK`: The address of the Move framework.

## Steps for `mevm-to-aptosvm.js`

1. Create a Gnosis Safe contract using the EVM wallet.
2. Create a multisig account using the Move wallet, and set the Gnosis Safe contract created in step 1 as one of the owners.
3. Create a multisig transaction (the content can be arbitrary, in this demo, an owner is added to the multisig account) using the Move wallet.
4. Create a transaction using the EVM wallet to vote for the transaction created in step 3 in the Move multisig account (the ABI is precompiled in the EVM, see the demo for details).
5. Propose and confirm the transaction created in step 4 to the deployed safeService.
6. Execute the transaction created in step 4 using the EVM wallet.
7. Check whether the multisig account has voted successfully.

## Steps for `aptosvm-to-mevm.js`

1. Create a NumberRegistry.sol contract using the EVM wallet.
2. Call the setNumber function of the NumberRegistry contract using the Move wallet or using the Move Contract(you must compile the and publish the move package as the demo contract in move-contract).
3. Check whether the number is set successfully.

## Steps for `mooncoin.js`
1. Compile the and publish the move package(moon_coin.move) as the demo contract in move-contract.
2. Get the evm MoonCoin contract address from the MOVE MoonCoin contract using the Move wallet.
3. Call the mint function of the MoonCoin contract using the Move wallet.(ensure that the MoonCoin contract is deployed in the Move wallet, and you have enough balance to pay for the transaction fee) 
4. Call the transferFromMoveToEVM function of the Move MoonCoin contract using the Move wallet.
5. Check whether the mint and transfer functions are executed successfully.
6. Call the balanceOf function of the MoonCoin contract using the Move wallet to check the balance of the account.
7. Call the transferFromEVMToMove function of the EVM MoonCoin contract using the EVM wallet.
8. Check whether the transfer function is executed successfully.
9. Call the balanceOf function of the Move MoonCoin contract and Evm MoonCoin contract using the Move wallet to check the balance of the account.

## Note

This is a basic overview of the project. For more detailed information, please refer to the comments in the source code.
