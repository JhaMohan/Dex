import { ethers } from 'ethers';
import { Dispatch } from 'redux';
import TOKEN_ABI from '../abis/Token.json';
import EXCHAGE_ABI from '../abis/Exchange.json'

export const loadProvider = async (dispatch: Dispatch) => {
  let connection;
  connection = new ethers.BrowserProvider(window.ethereum);

  console.log("connection", connection);
  dispatch({ type: "provider/PROVIDER_LOADED", connection });
  return connection;
}


export const loadNetwork = async (provider: any, dispatch: Dispatch) => {
  let { chainId } = await provider.getNetwork();
  console.log("called here");
  chainId = Number(chainId);
  dispatch({ type: "provider/NETWORK_LOADED", chainId });

  return chainId;
}

export const loadAccount = async (dispatch: Dispatch) => {
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const account = ethers.getAddress(accounts[0]);
  dispatch({ type: "provider/ACCOUNT_LOADED", account });
  return account;
}

export const loadToken = async (provider, address: string, dispatch: Dispatch) => {
  let token, symbol;

  token = new ethers.Contract(address, TOKEN_ABI, provider);
  symbol = await token.symbol();

  dispatch({ type: "token/TOKEN_LOADED", token, symbol });

  return token;
}