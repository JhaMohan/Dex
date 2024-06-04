import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ethers } from "ethers";
import config from '../config.json';
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadToken
} from '../state/interaction'

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    const account = await loadAccount(dispatch);
    console.log(account);

    //Connect Ethers to blockchain
    const provider = await loadProvider(dispatch);
    console.log(provider);
    const chainId: bigint = await loadNetwork(provider, dispatch);


    const contract = await loadToken(provider, config[chainId].pulseToken.address, dispatch);
    console.log(await contract.getAddress());
    const sym = await contract.symbol();
    console.log(sym)

  }

  useEffect(() => {
    loadBlockchainData();

  })

  return (
    <div>
      {/* Navbar */}

      <main className="exchange grid">
        <section className="exchange__section--left grid">

          {/* Market */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className="exchange__section--right grid">

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBooks */}

        </section>
      </main>
    </div>
  );
}

export default App;
