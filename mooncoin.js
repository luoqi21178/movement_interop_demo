let { ethers, ContractFactory, getDefaultProvider } = require('ethers')
let { EthersAdapter, SafeFactory, ContractNetworksConfig } = require('@safe-global/protocol-kit')
let { AptosAccount, FungibleAssetClient, CoinClient, MoveView, BCS, AptosClient, HexString, TxnBuilderTypes } = require("aptos")
const dotenv = require("dotenv")
dotenv.config()
let BN = require("bignumber.js");
const toMathAmount = (amount, decimals = 6) => new BN(amount.toString()).dividedBy(new BN(Math.pow(10, decimals))).toFixed();


const client = new AptosClient(process.env.MOVEMENT_RPC_ENDPOINT);
let pk = process.env.MOVE_PRIVATE_KEY;
let owner = new AptosAccount(new HexString(pk).toUint8Array())
let testAccount = new AptosAccount(new HexString(process.env.MOVE_TEST_ACCOUNT).toUint8Array())

const fs = require("fs");
const path = require("path");

const web3Provider = process.env.EVM_RPC_ENDPOINT
const provider = getDefaultProvider(web3Provider)
const evm_wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, provider);
const data = require("./MovementCoin.json")
const moveModule = "./move-contract";
let coinClient = new CoinClient(client)
let evmContract;
let asset_address;
let interface = new ethers.utils.Interface(data.abi);

async function deployMovePackage() {
	const moduleData = fs.readFileSync(path.join(moveModule, "build", "CallEVMDemo", "bytecode_modules", "moon_coin.mv"));
	const packageMetadata = fs.readFileSync(path.join(moveModule, "build", "CallEVMDemo", "package-metadata.bcs"));
	let txnHash = await client.publishPackage(owner, new HexString(packageMetadata.toString("hex")).toUint8Array(), [
		new TxnBuilderTypes.Module(new HexString(moduleData.toString("hex")).toUint8Array()),
	]);
	await client.waitForTransaction(txnHash, { checkSuccess: true });
}

async function initial() {
	let payload = {
		function: `${owner.address()}::moon_coin::get_evm_address`,
		type_arguments: [],
		arguments: [],
	};
	let result = await client.view(payload);
	let contract_address = "0x" + result[0].slice(26, 68)
	evmContract = new ethers.Contract(contract_address, data.abi, evm_wallet);

	payload = {
		function: `${owner.address()}::moon_coin::get_metadata`,
		type_arguments: [],
		arguments: [],
	};
	asset_address = (await client.view(payload))[0].inner;
}

// Function to get the balance of the wallets
async function getBalance() {
	// Get the balance of the move wallet
	let move_balance = await coinClient.checkBalance(owner.address(), { coinType: asset_address })
	console.log(`move wallet balance ${toMathAmount(move_balance)}`);

	// Get the balance of the evm wallet
	let evm_balance = await evmContract.balanceOf(evm_wallet.address);
	console.log(`evm wallet balance ${toMathAmount(evm_balance)}`);
}

// Function to mint moon coins
async function mint() {
	let payload = {
		function: `${owner.address()}::moon_coin::mint`,
		type_arguments: [],
		arguments: [owner.address(), 100000000],
	};
	let txn = await client.generateTransaction(owner.address(), payload);
	console.log(`mint mooncoin tx ${await submitTx(txn)}`);
}

// Function to submit a transaction
async function submitTx(rawTxn, signer=owner) {
	const bcsTxn = await client.signTransaction(signer, rawTxn);
	let result = await client.simulateTransaction(signer, rawTxn);
	const pendingTxn = await client.submitTransaction(bcsTxn);
	await client.waitForTransaction(pendingTxn.hash)
	return pendingTxn.hash;
}

// Function to convert hex to buffer
function toBuffer(hex) {
	return new HexString(hex).toUint8Array();
}

// Function to transfer moon coins from move to evm
async function transferFromMoveToEVM() {
	let res = await coinClient.transfer(owner,  evm_wallet.address, 5000000, { coinType: asset_address });
	console.log(`transfer mooncoin from move to evm tx ${res}`);
}

// Function to transfer moon coins from evm to move
async function transferFromEVMToMove() {
	let from = owner.address().hexString;
	let res = await evmContract.transferToMove(from, 1000000);
	console.log(`transfer mooncoin from evm to move tx ${res}`);
}

// Function to deposit gas to the evm wallet
async function deposit(addr, amount) {
	let rawTxn = await client.generateTransaction(owner.address(), {
		function: `0x1::evm::deposit`,
		type_arguments: [],
		arguments: [toBuffer(addr), toBuffer(amount)]
	});
	console.log(await submitTx(rawTxn));
}

async function run() {

	await initial();
	await getBalance()
	await transferFromMoveToEVM()
	await getBalance()
	await transferFromEVMToMove()
	await getBalance()
}

run().then()

