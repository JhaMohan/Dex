import { ethers } from 'ethers';
import TOKEN_ABI from '../abis/Token.json';
import EXCHAGE_ABI from '../abis/Exchange.json'
import { PROVIDER_LOADED, NETWORK_LOADED, ACCOUNT_LOADED, BALANCE_LOADED } from './slices/providerSlice'
import { Dispatch } from '@reduxjs/toolkit';
import { TOKEN_1_BALANCE_LOADED, TOKEN_1_LOADED, TOKEN_2_LOADED, TOKEN_2_BALANCE_LOADED } from './slices/tokenSlice';
import { EXCHANGE_LOADED, EXCHANGE_TOKEN_1_BALANCE_LOADED, EXCHANGE_TOKEN_2_BALANCE_LOADED, TRANSFER_FAIL, TRANSFER_REQUEST, TRANSFER_SUCESS } from './slices/exchangeSlice';
import { Contract } from 'ethers';

export const loadProvider = async (dispatch: Dispatch) => {
  let connection = new ethers.BrowserProvider(window.ethereum);
  dispatch(PROVIDER_LOADED(connection));
  return connection;
}


export const loadNetwork = async (provider: ethers.BrowserProvider, dispatch: Dispatch) => {
  let { chainId } = await provider.getNetwork();
  dispatch(NETWORK_LOADED(chainId.toString()));

  return chainId.toString();
}

export const loadAccount = async (provider: ethers.BrowserProvider, dispatch: Dispatch) => {
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const account = ethers.getAddress(accounts[0]);
  dispatch(ACCOUNT_LOADED(account));

  let accountBalance = await provider.getBalance(account);
  let accountBalances: string = ethers.formatEther(accountBalance);
  dispatch(BALANCE_LOADED(accountBalances));

  return account;
}

export const loadTokens = async (provider: ethers.BrowserProvider, addresses: string[], dispatch: Dispatch) => {
  let token, symbol;

  token = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
  symbol = await token.symbol();

  dispatch(TOKEN_1_LOADED({ token, symbol }));

  token = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
  symbol = await token.symbol();

  dispatch(TOKEN_2_LOADED({ token, symbol }));

  return token;
}


export const loadExchange = async (provider: ethers.BrowserProvider, address: string, dispatch: Dispatch) => {
  let exchange;
  exchange = new ethers.Contract(address, EXCHAGE_ABI, provider);
  dispatch(EXCHANGE_LOADED(exchange));

  return exchange;
}

export const subscribeToEvents = async (exchange: ethers.Contract, dispatch: Dispatch) => {
  exchange.on('Deposit', (token, user, amount: string, balance, event) => {
    console.log("come to subscription", event);
    dispatch(TRANSFER_SUCESS(event.eventName));
  })
}



//----------------------------------------------------------------
// LOAD USER BALANCES (WALLET & EXCHANGE BALANCES)

export const loadBalances = async (exchange: ethers.Contract, tokens: ethers.Contract[], account: string, dispatch: Dispatch) => {
  let balance = await tokens[0].balanceOf(account);
  balance = ethers.formatUnits(balance, 18);
  dispatch(TOKEN_1_BALANCE_LOADED(balance));

  balance = await exchange.balanceOf(await tokens[0].getAddress(), account);
  balance = ethers.formatUnits(balance, 18);
  dispatch(EXCHANGE_TOKEN_1_BALANCE_LOADED(balance));

  balance = await tokens[1].balanceOf(account);
  balance = ethers.formatUnits(balance, 18);
  dispatch(TOKEN_2_BALANCE_LOADED(balance));

  balance = await exchange.balanceOf(await tokens[1].getAddress(), account);
  balance = ethers.formatUnits(balance, 18);
  dispatch(EXCHANGE_TOKEN_2_BALANCE_LOADED(balance));

}


// ----------------------------------------------------------------
// TRANSFER TOKENS (DEPOSITE & WITHDRAW)

export const transferTokens = async (provider: ethers.BrowserProvider, exchange: ethers.Contract, transferType: string, token: ethers.Contract, amount: string, dispatch: Dispatch) => {
  let transaction;

  dispatch(TRANSFER_REQUEST());

  try {
    const signer = await provider.getSigner();
    const amountTotransfer: any = ethers.parseEther(amount);

    transaction = await token.connect(signer).approve(await exchange.getAddress(), amountTotransfer);
    await transaction.wait();

    transaction = await exchange.connect(signer).depositToken(await token.getAddress(), amountTotransfer);
    await transaction.wait();
  } catch (error) {
    dispatch(TRANSFER_FAIL())
  }


}
