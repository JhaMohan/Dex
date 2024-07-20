import React, { ChangeEvent, useEffect, useState, useRef } from "react";
import pt from '../assets/pt.svg';
import eth from '../assets/eth.png'
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { loadBalances, transferTokens } from "../redux/interaction";
import { Contract } from "ethers";

const Balance: React.FC = () => {

  const [isDeposit, setIsDeposit] = useState(true);
  const [token1TransferAmount, setToken1TransferAmount] = useState('');
  const [token2TransferAmount, setToken2TransferAmount] = useState('');

  const provider = useAppSelector((state) => state.provider.connection);
  const account = useAppSelector((state) => state.provider.account);

  const symbols = useAppSelector((state) => state.tokens.symbols);
  const tokens = useAppSelector((state) => state.tokens.contracts);
  const tokenBalances = useAppSelector((state) => state.tokens.balances);

  const exchange = useAppSelector((state) => state.exchange.contract);
  const exchangeBalances = useAppSelector((state) => state.exchange.balances)
  const transferInProgress = useAppSelector((state) => state.exchange.transferInProgress)

  const dispatch = useAppDispatch();


  const tabHandler = (e: React.MouseEvent<HTMLButtonElement>) => {

    const target = e.target as HTMLButtonElement;
    if (depositRef.current && target.className !== depositRef.current.className) {
      target.className = "tab tab--active";
      depositRef.current.className = "tab";
      setIsDeposit(false);
    } else if (withdrawRef.current) {
      target.className = "tab tab--active";
      withdrawRef.current.className = "tab";
      setIsDeposit(true);
    }
  }

  const amountHandler = async (e: ChangeEvent<HTMLInputElement>, token: Contract) => {
    if (token.target === tokens[0].target) {
      setToken1TransferAmount(e.target.value);
    } else {
      setToken2TransferAmount(e.target.value);
    }
  }

  // [done] Step 1: do transfer
  // [done] Step 2: Notify app that transfer is pending
  // [done] Step 3: Get confirmation from blockchain that transfer was successfull
  // [done] Step 4: Notify app that transfer was successful
  // [done] Step 5: Handle transfer fails - notify app




  const depositeHandler = async (e: React.FormEvent<HTMLFormElement>, token: Contract) => {
    e.preventDefault();

    if (token.target === tokens[0].target) {
      transferTokens(provider, exchange, "Deposit", token, token1TransferAmount, dispatch);
      setToken1TransferAmount('');
    } else {
      transferTokens(provider, exchange, "Deposit", token, token2TransferAmount, dispatch);
      setToken2TransferAmount('');
    }

  }

  const withdrawHandler = async (e: React.FormEvent<HTMLFormElement>, token: Contract) => {
    e.preventDefault();

    if (token.target === tokens[0].target) {
      transferTokens(provider, exchange, "Withdraw", token, token1TransferAmount, dispatch);
      setToken1TransferAmount('');
    } else {
      transferTokens(provider, exchange, "Withdraw", token, token2TransferAmount, dispatch);
      setToken2TransferAmount('');
    }

  }

  const depositRef = useRef<HTMLButtonElement>(null);
  const withdrawRef = useRef<HTMLButtonElement>(null);

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
          <button onClick={tabHandler} ref={depositRef} className="tab tab--active">Deposite</button>
          <button onClick={tabHandler} ref={withdrawRef} className="tab">Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (PT) */}
      <div className="exchange__transfers--form">
        <div className="flex-between">
          <p><small>Token</small><br /><img width="20" height="20" src={pt} alt="Token logo" />{symbols?.[0]}</p>
          <p><small>Wallet</small><br />{tokenBalances?.[0]}</p>
          <p><small>Exchange</small><br />{exchangeBalances?.[0]}</p>
        </div>
        <form onSubmit={isDeposit ? (e) => depositeHandler(e, tokens[0]) : (e) => withdrawHandler(e, tokens[0])}>
          <label htmlFor="token0">{symbols?.[0]} Amount</label>
          <input
            type="text"
            id="token0"
            placeholder="0.000"
            value={token1TransferAmount}
            onChange={(e) => amountHandler(e, tokens[0])} />
          <button className="button" type="submit" >

            {isDeposit ? <span>Deposit</span> : <span>Withdraw</span>}

          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw component 2 (mETH) */}
      <div className="exchange__transfers--form">

        <div className="flex-between">
          <p><small>Token</small><br /><img width="20" height="20" src={eth} alt="Token logo" />{symbols?.[1]}</p>
          <p><small>Wallet</small><br />{tokenBalances?.[1]}</p>
          <p><small>Exchange</small><br />{exchangeBalances?.[1]}</p>
        </div>
        <form onSubmit={isDeposit ? (e) => depositeHandler(e, tokens[1]) : (e) => withdrawHandler(e, tokens[1])}>
          <label htmlFor="token1">{symbols?.[1]} Amount</label>
          <input
            type="text"
            id="token1"
            placeholder="0.000"
            value={token2TransferAmount}
            onChange={(e) => amountHandler(e, tokens[1])}
          />
          <button className="button" type="submit">
            <span>
              {isDeposit ? 'Deposit' : 'Withdraw'}
            </span>
          </button>
        </form>
      </div>

      <hr />

    </div >


  )
}

export default Balance;