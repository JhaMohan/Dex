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
  allOrders: {},
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
  allOrders: {
    loaded: false,
    data: []
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

    //----------------------------------------------------------------
    // BUY && SELL
    //----------------------------------------------------------------
    // TRANSFER CASES (DEPOSIT & WITHDRAWS)

    NEW_ORDER_REQUEST: (state) => {
      return {
        ...state,
        transaction: {
          transactionType: 'New Order',
          isPending: true,
          isSuccessful: false,
        },
        transferInProgress: true
      }
    },
    NEW_ORDER_SUCCESS: (state, action) => {
      let index = state.allOrders.data.findIndex((item) => item.id === action.payload.order.id);
      let data;
      if (index !== -1) {
        data = state.allOrders.data;
      } else {
        data = [...state.allOrders.data, action.payload.order];
      }
      return {
        ...state,
        allOrders: {
          ...state.allOrders,
          loaded: true,
          data
        },
        transaction: {
          transactionType: 'New Order',
          isPending: false,
          isSuccessful: true,
        },
        transferInProgress: false,
        events: [action.payload.eventName, ...state.events]
      }
    },
    NEW_ORDER_FAIL: (state) => {
      return {
        ...state,
        transaction: {
          transactionType: 'New Order',
          isPending: false,
          isSuccessful: false,
          isError: true
        },
        transferInProgress: false
      }
    },

  },
})

export const { EXCHANGE_LOADED, EXCHANGE_TOKEN_1_BALANCE_LOADED, EXCHANGE_TOKEN_2_BALANCE_LOADED, TRANSFER_REQUEST, TRANSFER_SUCESS, TRANSFER_FAIL, NEW_ORDER_SUCCESS, NEW_ORDER_FAIL, NEW_ORDER_REQUEST } = exchangeSlice.actions;
export default exchangeSlice.reducer;