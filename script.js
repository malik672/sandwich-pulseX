var ethers = require("ethers");
const abiDecoder = require("abi-decoder");
const UNISWAP = require("@uniswap/sdk");
const abi = require("./abi.json");
const conc = require("./conc.json");
const erc20 = require("./ecr20ABI.json");
const web3 = require("web3");

require("dotenv").config(); // Load environment variables from .env file
const Web3Provider = require("@ethersproject/providers").Web3Provider;


var url = "wss://rpc-pulsechain.g4mm4.io";

const a = abiDecoder.addABI(abi);

const limit = 0; //amount of wpls the user must have bought

const myLimits = 1000; //the amount you want to spend to buy

const conc_add = "";

let txHash = "";

let txRepeat = "";

let checks = true;

let tokenParams = [];

//only verified tokens allowed
let verified = {
  "0x6b175474e89094c44da98b954eedeac495271d0f": true, //pDAI
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": true, //pWBTC
};

//HTTP NODE
const HTTP_ENDPOINT = process.env.HTTP_ENDPOINT;

let provider = new ethers.getDefaultProvider(HTTP_ENDPOINT);

//PRIVATE KEY
const privateKey = process.env.PRIVATE_KEY;

const account = web3.eth.accounts.privateKeyToAccount(privateKey);

const wallet = new ethers.Wallet(privateKey, provider);

UNISWAP_ROUTER_ADDRESS = process.env.UNISWAP_ROUTER_ADDRESS;

UNISWAP_ROUTER_ABI = abi;

const providers = new web3.HttpProvider(HTTP_ENDPOINT);

const contract = new web3.Contract(conc.abi, UNISWAP_ROUTER_ADDRESS);

UNISWAP_ROUTER_CONTRACT = new ethers.Contract(
  UNISWAP_ROUTER_ADDRESS,
  conc.abi,
  providers
);

const you = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, conc.abi, provider);

var customws = new ethers.WebSocketProvider(url);

/**
 * Main function that determines whether to buy or sell based on the 'checks' variable.
 */
async function main() {
  // while (true) { // Infinite loop

  if (checks) {
    await buy(); // Wait for the buy function to complete
  } else if (!checks) {
    await sell(tokenParams[0], tokenParams[1]); // Wait for the sell function to complete
    tokenParams = [];
  }

  // Add a delay (e.g., 1 second) to avoid constant polling
  //   await sleep(1000); // Sleep for 1 second
  // }
}

// Helper function to introduce a delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Start the main loop
main();

/**
 * Listen for pending transactions and execute MEV opportunities.
 */
async function buy() {
  customws.on("pending", async (tx) => {
    try {
      const r = await customws.getTransaction(tx);
      if (txRepeat !== r.hash) {
        txRepeat = r.hash;

        // Check if the transaction is going to a specific address
        if (r.to === "0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02") {
          const decodedData = abiDecoder.decodeMethod(r.data);

          const bigIntValue = BigInt(`${r.value}`); // Your original BigInt value
          const dividedValue = bigIntValue / BigInt(10n ** 18n);


          const arr = [...decodedData.params[2].value];
          if (
            decodedData.name === "swapExactTokensForTokens" &&
            verified[decodedData.params[2].value[arr.length - 1]] === true
          ) {
            console.log(
              "----------------------------------------------------------------------MEV opportunity found----------------------------------------------------------------------------------"
            );
            console.log(decodedData, decodedData.params[2]);
            tokenParams = decodedData.params[2].value;
            // Remove all event listeners to prevent further processing
            customws.removeAllListeners();
            console.log(decodedData.params, r.hash);
            const arr = [...decodedData.params[2].value];

            const result = await you
              .connect(wallet)
              .swapWETHToToken(
                "0xA1077a294dDE1B09bB078844df40758a5D0f9a27",
                decodedData.params[2].value[arr.length - 1],
                {
                  gasPrice: 50000,
                  gasLimit: 50000,
                }
              );

            // Store the transaction hash and prevent further buying
            txHash = r.hash;
            //checks = false;

            console.log("Transaction Result:", result);

            const resul = await you
              .connect(wallet)
              .swapWETHToToken(
                decodedData.params[2].value[arr.length - 1],
                "0xA1077a294dDE1B09bB078844df40758a5D0f9a27"
              );

            console.log("Transaction Result:", resul);

            main();
          } else if (
            decodedData.name === "swapTokensForExactTokens" &&
            verified[decodedData.params[2].value[arr.length - 1]] === true
          ) {
            console.log(
              "----------------------------------------------------------------------MEV opportunity found----------------------------------------------------------------------------------"
            );
            console.log(decodedData, decodedData.params[2]);
            tokenParams = decodedData.params[2].value;
            // Remove all event listeners to prevent further processing
            customws.removeAllListeners();
            console.log(decodedData.params, r.hash);
            const arr = [...decodedData.params[2].value];

            const result = await you
              .connect(wallet)
              .swapWETHToToken(
                "0xA1077a294dDE1B09bB078844df40758a5D0f9a27",
                decodedData.params[2].value[arr.length - 1],
                {
                  gasPrice: 50000,
                  gasLimit: 50000,
                }
              );

            // Store the transaction hash and prevent further buying
            txHash = r.hash;
            //checks = false;

            console.log("Transaction Result:", result);

            const resul = await you
              .connect(wallet)
              .swapWETHToToken(
                decodedData.params[2].value[arr.length - 1],
                "0xA1077a294dDE1B09bB078844df40758a5D0f9a27"
              );

            console.log("Transaction Result:", resul);

            main();
          } else if (
            verified[decodedData.params[1].value[1]] === true &&
            dividedValue > limit ||
            decodedData.name === "swapExactETHForTokens"
          ) {
            console.log(
              "----------------------------------------------------------------------MEV opportunity found----------------------------------------------------------------------------------"
            );
            console.log("Function Name:", decodedData.name);
            console.log("Token Amounts:", decodedData.params[1].value);
            tokenParams = decodedData.params[1].value;
            console.log("Transaction Data:", decodedData, r);

            // Remove all event listeners to prevent further processing
            customws.removeAllListeners();
            wallet.sendTransaction
            const result = await you
              .connect(wallet)
              .swapWETHToTokens(
                decodedData.params[1].value[0],
                decodedData.params[1].value[1],
                {
                  gasPrice: 50000,
                  gasLimit: 50000,
                }
              );

            // Store the transaction hash and prevent further buying
            txHash = r.hash;
            // checks = false;

            console.log("Transaction Result:", result);

            //SELL THE TOKENS WHEN BOUGHT
            const resul = await you
              .connect(wallet)
              .swapWETHToTokens(
                decodedData.params[1].value[1],
                decodedData.params[1].value[0]
              );

            console.log("Transaction Result:", resul);

            main();
          } else if (
            dividedValue > limit &&
            verified[decodedData.params[1].value[1]] === true ||
            decodedData.name === "swapETHForExactTokens"
          ) {
            console.log(
              "----------------------------------------------------------------------MEV opportunity found----------------------------------------------------------------------------------"
            );
            console.log("Function Name:", decodedData.name);
            console.log("Token Amounts:", decodedData.params[1].value);
            tokenParams = decodedData.params[1].value;
            console.log("Transaction Data:", decodedData, r);

            // Remove all event listeners to prevent further processing
            customws.removeAllListeners();

            const result = await you
              .connect(wallet)
              .swapWETHToTokens(
                decodedData.params[1].value[0],
                decodedData.params[1].value[1],
                {
                  gasPrice: 50000,
                  gasLimit: 50000,
                }
              );

            // Store the transaction hash and prevent further buying
            txHash = r.hash;
            // checks = false;

            console.log("Transaction Result:", result);

            //SELL THE TOKENS WHEN BOUGHT
            const resul = await you
              .connect(wallet)
              .swapWETHToTokens(
                decodedData.params[1].value[1],
                decodedData.params[1].value[0]
              );

            console.log("Transaction Result:", resul);

            main();
          }
        }
        // console.log("TxHash:", r.hash);
      }
    } catch (error) {
      console.error("Error processing pending transaction:", error);

      // Handle the error and restart the MEV bot
      console.log(
        "--------------------------------------- Starting MEV bot again ----------------------------------------------------------------"
      );
      main();
    }
  });
}

// /**
//  * Function for handling selling logic.
//  * @param {string} token - The token to sell.
//  * @param {string} token1 - The token to receive in exchange.
//  */
async function sell(token, token1) {
  try {
    const red = you.connect(wallet).swapWETHToTokens(token1, token);
    checks = true;
    main();
    console.log(red);
  } catch (error) {
    console.log(error);
    console.log(
      "--------------------------------------- starting mev bot again ----------------------------------------------------------------"
    );
    main();
  }
}

// /**
//  * Function to approve token spending by a smart contract.
//  * @param {string} address - The address of the ERC-20 token contract.
//  * @returns {Promise<BigNumber>} - The token balance.
//  */
async function approve(address) {
  const erc20_approve = new ethers.Contract(address, erc20.abi, provider);
  const balance = await erc20_approve.connect(wallet).balance(account.address);
  await erc20_approve
    .connect(wallet)
    .approve(UNISWAP_ROUTER_ADDRESS, balance)
    .send({
      from: account.address,
    });
  return balance;
}
