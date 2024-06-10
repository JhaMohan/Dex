import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ethers } from 'ethers';

interface ProviderState {
  connection: ethers.BrowserProvider;
  chainId: string;
  account: string;
  balance: string;
}

const initialState: ProviderState = {
  connection: new ethers.BrowserProvider(window.ethereum),
  chainId: '',
  account: '',
  balance: '',
}


export interface SomeObject {
  type: string;
  connection: Object;
  chainId: number;
  account: string;
}
const providerSlice = createSlice({
  name: 'provider',
  initialState,
  reducers: {
    PROVIDER_LOADED: (state, action: PayloadAction<ethers.BrowserProvider>) => {
      return {
        ...state,
        connection: action.payload
      }
    },
    NETWORK_LOADED: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        chainId: action.payload
      }
    },
    ACCOUNT_LOADED: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        account: action.payload
      }
    },
    BALANCE_LOADED: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        balance: action.payload,
      }
    }
  }
})

export const { PROVIDER_LOADED, NETWORK_LOADED, ACCOUNT_LOADED, BALANCE_LOADED } = providerSlice.actions;
export default providerSlice.reducer;
