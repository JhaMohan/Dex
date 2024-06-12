import { ethers } from 'ethers';
import TOKEN_ABI from '../abis/Token.json';
import EXCHAGE_ABI from '../abis/Exchange.json'
import { PROVIDER_LOADED, NETWORK_LOADED, ACCOUNT_LOADED, BALANCE_LOADED } from './slices/providerSlice'
import { Dispatch } from '@reduxjs/toolkit';
import { TOKEN_1_LOADED, TOKEN_2_LOADED } from './slices/tokenSlice';
import { EXCHANGE_LOADED } from './slices/exchangeSlice';

export const loadProvider = async (dispatch: Dispatch) => {
  let connection;
  connection = new ethers.BrowserProvider(window.ethereum);
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