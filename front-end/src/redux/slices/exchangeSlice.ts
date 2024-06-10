import { PayloadAction, createSlice } from "@reduxjs/toolkit";


interface ExchangeState {
  loaded: boolean;
  contract: Object;
}

const initialState: ExchangeState = {
  loaded: false,
  contract: {}
}


const exchangeSlice = createSlice({
  name: 'exchange',
  initialState,
  reducers: {
    EXCHANGE_LOADED: (state, action: PayloadAction<Object>) => {
      return {
        ...state,
        loaded: true,
        contract: action.payload
      }
    }
  },
})

export const { EXCHANGE_LOADED } = exchangeSlice.actions;
export default exchangeSlice.reducer;