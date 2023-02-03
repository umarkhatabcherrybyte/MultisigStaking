const Web3 = require("web3");
const BridgeEth = require("../build/contracts/BridgeEth.json");
const BridgeBsc = require("../build/contracts/BridgeBsc.json");

// Instantiating web3 object with the Ethereum network's WebSocket URL
const web3Eth = new Web3(
  "wss://goerli.infura.io/ws/v3/e3562069a1d44d18aa58a3ea55ccf21a"
);

// Instantiating web3 object with the Binance Smart Chain network's RPC URL
const web3Bsc = new Web3("https://data-seed-prebsc-1-s3.binance.org:8545");

// The private key of the wallet to be used as the admin address
const adminPrivKey =
  "20f59edb6af6f23b164d83f03175455b72a9d9fc514006a48cbea92c49101a8d";

// Deriving the public address of the wallet using the private key
const { address: admin } = web3Bsc.eth.accounts.wallet.add(adminPrivKey);

// Instantiating the BridgeEth contract with its ABI and address
const bridgeEth = new web3Eth.eth.Contract(
  BridgeEth.abi,
  BridgeEth.networks["5"].address
);

// Instantiating the BridgeBsc contract with its ABI and address
const bridgeBsc = new web3Bsc.eth.Contract(
  BridgeBsc.abi,
  BridgeBsc.networks["97"].address
);

// Listening to Transfer events emitted by the BridgeEth contract
console.log("Listening to the events....");

//

bridgeEth.events.Proposed({ fromBlock: 0 }).on("data", async (event) => {
  const { sender, receiver, amount, proposer, signature } = event.returnValues;
  console.log(`
    Transaction Proposed:
    - From ${sender} 
    - To ${receiver} 
    - Amount ${amount} tokens
    - Proposer ${proposer}
    - Signature ${signature}
  `);
});

bridgeEth.events.Confirmed({ fromBlock: 0 }).on("data", async (event) => {
  const { sender, receiver, amount, signer, signature } = event.returnValues;
  console.log(`
    Transaction Proposed:
    - From ${sender} 
    - To ${receiver} 
    - Amount ${amount} tokens
    - Confirmed by ${signer}
    - Signature ${signature}
  `);
});

//
bridgeEth.events
  .Transfer({ fromBlock: 0, step: 0 })
  .on("data", async (event) => {
    const { from, to, amount, step } = event.returnValues; // Defining the method to be called on the BridgeBsc contract

    console.log(`
    Transfer Fired:
    - from ${from} 
    - to ${to} 
    - amount ${amount} tokens
    - Type ${step == 0 ? "Burn" : "Mint"}
    `);

    // Destructuring the values from the event
    const tx = bridgeBsc.methods.mint(from, to, amount);

    // Getting the gas price and gas cost required for the method call
    const [gasPrice, gasCost] = await Promise.all([
      web3Bsc.eth.getGasPrice(),
      tx.estimateGas({ from: admin }),
    ]);

    // Encoding the ABI of the method
    const data = tx.encodeABI();

    // Preparing the transaction data
    const txData = {
      from: admin,
      to: bridgeBsc.options.address,
      data,
      gas: gasCost,
      gasPrice,
    };

    // Sending the transaction to the Binance Smart Chain
    const receipt = await web3Bsc.eth.sendTransaction(txData);

    // Logging the transaction hash
    console.log(`Transaction hash: ${receipt.transactionHash}`);

    // Logging the details of the processed transfer
    console.log(`
Processed transfer:
- from ${from} 
- to ${to} 
- amount ${amount} tokens

`);
  });
