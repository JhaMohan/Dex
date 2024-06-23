import React, { useEffect, useState } from "react";
import pt from '../assets/pt.svg';
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { loadBalances, transferTokens } from "../redux/interaction";
import { Contract } from "ethers";

const Balance: React.FC = () => {

  const [token1TransferAmount, setToken1TransferAmount] = useState('')

  const provider = useAppSelector((state) => state.provider.connection);
  const account = useAppSelector((state) => state.provider.account);

  const symbols = useAppSelector((state) => state.tokens.symbols);
  const tokens = useAppSelector((state) => state.tokens.contracts);
  const tokenBalances = useAppSelector((state) => state.tokens.balances);

  const exchange = useAppSelector((state) => state.exchange.contract);
  const exchangeBalances = useAppSelector((state) => state.exchange.balances)
  const transferInProgress = useAppSelector((state) => state.exchange.transferInProgress)

  const dispatch = useAppDispatch();

  const amountHandler = async (e: React.ChangeEvent<HTMLInputElement>, token: Contract) => {
    if (token.address === tokens[0].address) {
      setToken1TransferAmount(e.target.value);
    }
  }

  // [done] Step 1: do transfer
  // [done] Step 2: Notify app that transfer is pending
  // [done] Step 3: Get confirmation from blockchain that transfer was successfull
  // [done] Step 4: Notify app that transfer was successful
  // [done] Step 5: Handle transfer fails - notify app




  const depositeHandler = async (e: React.FormEvent<HTMLFormElement>, token: Contract) => {
    e.preventDefault();
    if (token.address === tokens[0].address) {
      transferTokens(provider, exchange, "Deposit", token, token1TransferAmount, dispatch);
      setToken1TransferAmount('');
    }
  }

  useEffect(() => {
    if (exchange && tokens[0] && tokens[1] && account) {
      loadBalances(exchange, tokens, account, dispatch);
    }
  }, [exchange, tokens, account, transferInProgress]);

  return (
    <div className="component exchange__transfers">
      <div className="component__header flex-between">
        <h2>Balance</h2>
        <div className="tabs">
          <button className="tab tab--active">Deposite</button>
          <button className="tab">Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (PT) */}
      <div className="exchange__transfers--form">
        <div className="flex-between">
          <p><small>Token</small><br /><img width="20" height="20" src={pt} alt="Token logo" />{symbols?.[0]}</p>
          <p><small>Wallet</small><br />{tokenBalances?.[0]}</p>
          <p><small>Exchange</small><br />{exchangeBalances?.[0]}</p>
        </div>
        <form onSubmit={(e) => depositeHandler(e, tokens[0])}>
          <label htmlFor="token0">{symbols?.[0]} Amount</label>
          <input
            type="text"
            id="token0"
            placeholder="0.000"
            value={token1TransferAmount}
            onChange={(e) => amountHandler(e, tokens[0])} />
          <button className="button" type="submit" >
            <span>Deposite</span>
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw component 2 (mETH) */}
      <div className="exchange__transfers--form">
        <div className="flex-between">

        </div>
        <form>
          <label htmlFor="token1"></label>
          <input type="text" id="token1" placeholder="0.000" />
          <button className="button" type="submit">
            <span></span>
          </button>
        </form>
      </div>

      <hr />

    </div >


  )
}

export default Balance;