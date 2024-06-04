import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface providerState {
  connection: Object | null;
  chainId: number;
  account: string
}

const initialState: providerState = {
  connection: null,
  chainId: 0,
  account: ''
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
    PROVIDER_LOADED: (state = initialState, action: PayloadAction<SomeObject>) => {
      return {
        ...state,
        connection: action.connection
      }
    },
    NETWORK_LOADED: (state: any, action: PayloadAction<SomeObject>) => {
      return {
        ...state,
        chainId: action.chainId
      }
    },
    ACCOUNT_LOADED: (state, action: PayloadAction<SomeObject>) => {
      return {
        ...state,
        account: action.account
      }
    }
  }
})

export const { PROVIDER_LOADED, NETWORK_LOADED, ACCOUNT_LOADED } = providerSlice.actions;
export default providerSlice.reducer;
