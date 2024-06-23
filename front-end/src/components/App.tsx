import React, { useEffect } from "react";
import config from '../config.json';
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents
} from '../redux/interaction'
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import Navbar from "./Navbar";
import Markets from "./Markets"
import Balance from "./Balance";

const App: React.FC = () => {
  const dispatch = useAppDispatch();


  const loadBlockchainData = async () => {


    //Connect Ethers to blockchain
    const provider = await loadProvider(dispatch);

    // fetch current network's chainId(e.g: hardhat 31337, sepolia: 11155111)
    const chainId = await loadNetwork(provider, dispatch);
    console.log(chainId);

    // Reaload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    })

    // Fetch current account and balance from metamask when account changed
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch);
    })
    // await loadAccount(provider, dispatch);

    //Load token smart contract
    const pulseToken = config[chainId as keyof typeof config].pulseToken;
    const mETH = config[chainId as keyof typeof config].mETH;
    await loadTokens(provider, [pulseToken.address, mETH.address], dispatch);

    //Load exchange smart contract
    const exchangeConfig = config[chainId as keyof typeof config].exchange;
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch);

    // subscribe to events
    await subscribeToEvents(exchange, dispatch);

  }

  useEffect(() => {
    loadBlockchainData();

  })

  return (
    <div>
      <Navbar />


      <main className="exchange grid">
        <section className="exchange__section--left grid">

          <Markets />

          <Balance />
          {/* Order */}

        </section>
        <section className="exchange__section--right grid">

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBooks */}

        </section>
      </main>
    </div >
  );
}

export default App;
