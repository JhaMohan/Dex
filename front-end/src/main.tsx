import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.tsx";
import "./App.css";

import { Provider } from 'react-redux';
import { store } from './state/store';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
