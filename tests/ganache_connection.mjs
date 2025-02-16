import dotenv from 'dotenv';
dotenv.config({ path: "../.env" });
import { Web3, WebSocketProvider } from 'web3';


// Web Socket url
const ganache_ws = process.env.GANACHE_WS;

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

console.log("Listening for events...");

// Subscribe to all events
web3.eth.subscribe("logs", {}, (error, event) => {
    if (!error) {
        console.log("New Event:", event);
    } else {
        console.error("Error:", error);
    }
});

// Keep the script running
process.stdin.resume();