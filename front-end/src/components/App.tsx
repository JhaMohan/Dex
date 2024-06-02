import { useEffect } from "react";
import { ethers } from "ethers";
import config from '../config.json';
import TOKEN_ABI from '../abis/Token.json';
import EXCHAGE_ABI from '../abis/Exchange.json'
import "../App.css";




function App() {


  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    console.log(accounts[0]);

    //Connect Ethers to blockchain
    const provider = new ethers.BrowserProvider(window.ethereum);
    // const signer = await provider.getSigner();
    const { chainId } = await provider.getNetwork();
    console.log(chainId);

    const contract = new ethers.Contract(config[chainId].pulseToken.address, TOKEN_ABI, provider);
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
