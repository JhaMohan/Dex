import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface TokenState {
  loaded: boolean;
  contracts: Object[],
  symbols: string[]
}

const initialState: TokenState = {
  loaded: false,
  contracts: [],
  symbols: []
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
        contracts: [...state.contracts, action.payload.token],
        symbols: [...state.symbols, action.payload.symbol]
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
    TOKEN_3_LOADED: (state = initialState, action: PayloadAction<TokenData>) => {
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.payload.token],
        symbols: [...state.symbols, action.payload.symbol]
      }
    },

  }
})

export const { TOKEN_1_LOADED, TOKEN_2_LOADED, TOKEN_3_LOADED } = tokenSlice.actions;
export default tokenSlice.reducer;