import React, { ChangeEvent } from "react"
import logo from '../assets/logo.png'
import eth from '../assets/eth.png'
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import Blockies from 'react-blockies'
import { loadAccount } from '../redux/interaction'
import config from '../config.json'


const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const provider = useAppSelector((state) => state.provider.connection);
  const chainId = useAppSelector((state) => state.provider.chainId);
  const account: string = useAppSelector((state) => state.provider.account);
  const balance: number = Number(useAppSelector((state) => state.provider.balance));

  const connectHandler = async () => {
    await loadAccount(provider, dispatch);
  }

  const networkHandler = async (e: ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: e.target.value }]
    })
  }


  return (
    <div className="exchange__header grid">
      <div className="exchange__header--brand flex">
        <img src={logo} className="logo" alt="pulse logo"></img>
        <h1>Pulse Token Exchange</h1>
      </div>
      <div className="exchange__header--networks flex">
        <img src={eth} alt="ETH logo" className="Eth ethlogo"></img>

        {chainId &&
          <select name="networks" id="networks" value={config[chainId as keyof typeof config] ? `0x${Number(chainId).toString(16)}` : `0`} onChange={(e) => networkHandler(e)}>
            <option value="0" disabled>Select Network</option>
            <option value="0x7A69">Localhost</option>
            <option value="0xAA36A7">Sepolia</option>
          </select>}

      </div>
      <div className="exchange__header--account flex">
        {(balance) ? (
          <p><small>My Balance:</small>{balance.toFixed(4)}</p>
        ) : (
          <p><small>My Balance:</small>0 ETH</p>
        )}
        {(account) ? (
          <a
            href={config[chainId as keyof typeof config] ? (`${config[chainId as keyof typeof config].explorerURL}/address/${account}`) : (`#`)}
            target="_blank"
            rel="norefferer"
          >
            {account.slice(0, 5) + '...' + account.slice(38, 42)}
            <Blockies
              seed={account}
              className="identicon"
              size={10}
              scale={3}
              color="#2187D0"
              bgColor="#F1F2F9"
              spotColor="#767F92"
            />
          </a>
        ) : (
          <button className="button" onClick={connectHandler}>Connect</button>
        )}
      </div>

    </div >
  )
}

export default Navbar;