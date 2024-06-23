import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface TokenState {
  loaded: boolean;
  contracts: any[],
  symbols: string[],
  balances: string[]
}

const initialState: TokenState = {
  loaded: false,
  contracts: [],
  symbols: [],
  balances: []
}


export interface TokenData {
  token: Object;
  symbol: string;
}

const tokenSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    TOKEN_1_LOADED: (state = initialState, action: PayloadAction<TokenData>) => {
      return {
        ...state,
        loaded: true,
        contracts: [action.payload.token],
        symbols: [action.payload.symbol]
      }
    },
    TOKEN_1_BALANCE_LOADED: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        loaded: true,
        balances: [action.payload]
      }
    },
    TOKEN_2_LOADED: (state = initialState, action: PayloadAction<TokenData>) => {
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.payload.token],
        symbols: [...state.symbols, action.payload.symbol]
      }
    },
    TOKEN_2_BALANCE_LOADED: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        loaded: true,
        balances: [...state.balances, action.payload]
      }
    },
  }
})

export const { TOKEN_1_LOADED, TOKEN_1_BALANCE_LOADED, TOKEN_2_LOADED, TOKEN_2_BALANCE_LOADED } = tokenSlice.actions;
export default tokenSlice.reducer;