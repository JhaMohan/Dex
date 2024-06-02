import config from '../../front-end/src/config.json';


import { ethers } from "hardhat";

const etherValue = (n: number) => {
  return ethers.parseUnits(n.toString(), "ether");
}

const wait = (seconds: number) => {
  const milliSeconds = seconds * 1000;
  return new Promise(resolve => setTimeout(resolve, milliSeconds));
}

async function main() {
  // get accounts
  const accounts = await ethers.getSigners();

  //Fetch network
  const { chainId } = await ethers.provider.getNetwork();
  console.log("Using chainId:", chainId);

  // Fetch deployed tokens
  const pulseToken = await ethers.getContractAt("Token", config[chainId].pulseToken.address);
  console.log(`PT Token fetched:`, await pulseToken.getAddress());

  const mETH = await ethers.getContractAt("Token", config[chainId].mETH.address);
  console.log(`mETH Token fetched: `, await mETH.getAddress());

  const mDAI = await ethers.getContractAt("Token", config[chainId].mDAI.address);
  console.log(`mDAI Token fetched:`, await mDAI.getAddress());

  // Fetch deployed Exchange
  const exchange = await ethers.getContractAt("Exchange", config[chainId].exchange.address);
  console.log(`exchange Token fetched:`, await exchange.getAddress());

  // Give token to accounts[1]
  const sender = accounts[0];
  const receiver = accounts[1];
  const amount = etherValue(10000);

  // Transfer 10,000 mEth to receiver ...
  let transaction, result: any
  transaction = await mETH.connect(sender).transfer(receiver.address, amount);
  console.log(`Transferred ${amount} mETH token from ${sender.address} to ${receiver.address} \n`);

  // Setup user for exchange
  const user1 = accounts[0];
  const user2 = accounts[1];


  const exchangeAddress = await exchange.getAddress();
  const pulseTokenAddress = await pulseToken.getAddress();
  const mETHAddress = await mETH.getAddress();

  // user1 aprove 10,000 PT token to  exchange ....
  transaction = await pulseToken.connect(user1).approve(exchangeAddress, amount);
  await transaction.wait();
  console.log(`Approved ${amount} PT token from ${user1.address}`);

  // user1 deposits 10,000 PT token to exchange........
  transaction = await exchange.connect(user1).depositToken(pulseTokenAddress, amount);
  await transaction.wait();
  console.log(`Deposited ${amount} PT token from ${user1.address}\n `);

  // user2 approve mETH to exchange ....
  transaction = await mETH.connect(user2).approve(exchangeAddress, amount);
  await transaction.wait();
  console.log(`Approved ${amount} mETH token from ${user2.address}`);

  // user2 deposits 10,000 mETH token to exchange........
  transaction = await exchange.connect(user2).depositToken(mETHAddress, amount);
  await transaction.wait();
  console.log(`Deposited ${amount} mETH token from ${user2.address}\n`);


  /////////////////////////////////////////////
  // Seed a Cancelled order
  //

  // User1 make order to get tokens
  let orderId;
  transaction = await exchange.connect(user1).makeOrder(mETHAddress, etherValue(10), pulseTokenAddress, etherValue(5));
  result = await transaction.wait();
  // console.log(result);
  console.log(`Make order from ${user1.address}`);

  // user1 cancel order
  orderId = result?.logs[0]?.args[0];
  // console.log("orderId", orderId);
  transaction = await exchange.connect(user1).cancelOrder(orderId);
  result = await transaction.wait();
  console.log(`Cancelled order from ${user1.address} \n`);

  // wait 1 second
  await wait(1);

  //////////////////////////////////////////////////////
  // Seed Filled orders
  ////////////////////////////////////////////////////

  // User1 make order 
  transaction = await exchange.connect(user1).makeOrder(mETHAddress, etherValue(100), pulseTokenAddress, etherValue(10));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}`);

  // user2 fill order
  orderId = result?.logs[0]?.args[0];
  transaction = await exchange.connect(user2).fillOrder(orderId);
  await transaction.wait();
  console.log(`Filled order from ${user2.address}\n`);

  // wait 1 sec
  await wait(1);


  // User1 make another order 
  transaction = await exchange.connect(user1).makeOrder(mETHAddress, etherValue(50), pulseTokenAddress, etherValue(15));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}`);

  // user2 fill order
  orderId = result?.logs[0]?.args[0];
  transaction = await exchange.connect(user2).fillOrder(orderId);
  await transaction.wait();
  console.log(`Filled order from ${user2.address}\n`);

  // wait 1 sec
  await wait(1);

  // User1 make final order 
  transaction = await exchange.connect(user1).makeOrder(mETHAddress, etherValue(200), pulseTokenAddress, etherValue(20));
  result = await transaction.wait();
  console.log(`Made order from ${user1.address}`);

  // user2 fill order
  orderId = result?.logs[0]?.args[0];
  transaction = await exchange.connect(user2).fillOrder(orderId);
  await transaction.wait();
  console.log(`Filled order from ${user2.address}\n`);

  // wait 1 sec
  await wait(1);

  // user 1 makes 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user1).makeOrder(mETHAddress, etherValue(10 * i), pulseTokenAddress, etherValue(10));
    await transaction.wait();

    console.log(`Made order from ${user1.address}`);

    // wait 1 sec
    await wait(1);
  }

  // user 2 makes 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user2).makeOrder(exchangeAddress, etherValue(10), mETHAddress, etherValue(10 * i));
    await transaction.wait();

    console.log(`Made order from ${user2.address}`);

    // wait 1 sec
    await wait(1);
  }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});