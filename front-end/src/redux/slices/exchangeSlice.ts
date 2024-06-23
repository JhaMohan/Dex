import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ethers } from 'ethers';


interface TransactionState {
  transactionType: string;
  isPending: boolean;
  isSuccessful: boolean
}

interface ExchangeState {
  loaded: boolean;
  contract: any;
  balances: string[];
  transaction: TransactionState;
  transferInProgress: boolean;
  events: string[],
  isError: boolean
}



const initialState: ExchangeState = {
  loaded: false,
  contract: {},
  balances: [],
  transaction: {
    transactionType: '',
    isPending: false,
    isSuccessful: false
  },
  transferInProgress: false,
  isError: false,
  events: []
}


const exchangeSlice = createSlice({
  name: 'exchange',
  initialState,
  reducers: {
    EXCHANGE_LOADED: (state, action: PayloadAction<ethers.Contract>) => {
      return {
        ...state,
        loaded: true,
        contract: action.payload
      }
    },
    EXCHANGE_TOKEN_1_BALANCE_LOADED: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        loaded: true,
        balances: [action.payload]
      }
    },
    EXCHANGE_TOKEN_2_BALANCE_LOADED: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        loaded: true,
        balances: [...state.balances, action.payload]
      }
    },
    //----------------------------------------------------------------
    // TRANSFER CASES (DEPOSIT & WITHDRAWS)

    TRANSFER_REQUEST: (state) => {
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: true,
          isSuccessful: false,
        },
        transferInProgress: true
      }
    },
    TRANSFER_SUCESS: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccessful: true,
        },
        transferInProgress: false,
        events: [action.payload, ...state.events]
      }
    },
    TRANSFER_FAIL: (state) => {
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccessful: false,
          isError: true
        },
        transferInProgress: false
      }
    },


  },
})

export const { EXCHANGE_LOADED, EXCHANGE_TOKEN_1_BALANCE_LOADED, EXCHANGE_TOKEN_2_BALANCE_LOADED, TRANSFER_REQUEST, TRANSFER_SUCESS, TRANSFER_FAIL } = exchangeSlice.actions;
export default exchangeSlice.reducer;