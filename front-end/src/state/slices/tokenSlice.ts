import { createSlice } from "@reduxjs/toolkit";

interface tokenState {
  loaded: boolean;
  contract: Object | null,
  symbol: string
}

const initialState: tokenState = {
  loaded: false,
  contract: null,
  symbol: ""
}


const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    TOKEN_LOADED: (state = initialState, action) => {
      return {
        ...state,
        loaded: true,
        contract: action.token,
        symbol: action.symbol
      }
    }
  }
})

export const { TOKEN_LOADED } = tokenSlice.actions;
export default tokenSlice.reducer;