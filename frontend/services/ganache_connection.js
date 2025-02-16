// import dotenv from 'dotenv';
// dotenv.config({ path: "../.env" });
import { Web3, WebSocketProvider } from 'web3';
// import daiid from '../../tests/DAIID.json' assert { type: 'json' };
// console.log(daiid)
import abi from '../configs/abi_config.js';

// Web Socket url
const ganache_ws = import.meta.env.VITE_GANACHE_WS;

// address of the contract
const address = import.meta.env.VITE_DAIID_ADDRESS
// const abi = abi.abi;

// Create a new WebsocketProvider
const provider = new WebSocketProvider(
	ganache_ws,
	{},
	{
		delay: 500,
		autoReconnect: true,
		maxAttempts: 10,
	},
);
const web3 = new Web3(provider);

function process_image_registration(data) {
	console.log(data);
	return data;
}

function process_vote_submission(data) {
	console.log(data);
	return data;
}

function process_vote_finalization(data) {
	console.log(data);
	return data;
}

async function subscribe_image_registration() {
	// create a new contract object, providing the ABI and address
	const contract = new web3.eth.Contract(abi, address);

	// subscribe to the smart contract event (see DAIID.sol file)
	const subscription = contract.events.ImageRegistered();

	// new value every time the event is emitted
	subscription.on('data', (event) => {
		const data = {
			address: event.address,
			imageHash: event.returnValues[0],
			ipfsCID: event.returnValues[1],
		}
		process_image_registration(data);
	});
}

async function subscribe_vote_submission(callback) {
	const contract = new web3.eth.Contract(abi, address);
	const subscription = contract.events.Voted();
	subscription.on('data', (event) => {
		const data = {
			node: event.returnValues[0],
			imageHash: event.returnValues[1],
			score: event.returnValues[2],
			weight: event.returnValues[3],
		}
		console.log(data);
		callback(data);
	});
}

async function subscribe_vote_finalization() {
	const contract = new web3.eth.Contract(abi, address);
	const subscription = contract.events.VoteFinalized();
	subscription.on('data', (event) => {
		const data = {
			address: event.address,
			imageHash: event.returnValues[0],
			ipfsCID: event.returnValues[1],
		}
		process_vote_finalization(data);
	});
}

export { subscribe_image_registration, subscribe_vote_submission, subscribe_vote_finalization };