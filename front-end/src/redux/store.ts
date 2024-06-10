import { configureStore } from '@reduxjs/toolkit'
import providerReducer from './slices/providerSlice'
import tokenReducer from './slices/tokenSlice'
import exchangeReducer from './slices/exchangeSlice'

export const store = configureStore({
  reducer: {
    provider: providerReducer,
    tokens: tokenReducer,
    exchange: exchangeReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),

})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch