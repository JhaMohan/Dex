import { useState, useRef } from "react";
import { makeBuyOrder, makeSellOrder } from "../redux/interaction";
import { useAppSelector, useAppDispatch } from "../redux/hooks";

const Order: React.FC = () => {
  const [isBuy, setIsBuy] = useState(true);
  const [amount, setAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const dispatch = useAppDispatch();
  const provider = useAppSelector((state) => state.provider.connection);
  const tokens = useAppSelector((state) => state.tokens.contracts);
  const exchange = useAppSelector((state) => state.exchange.contract);

  const buyRef = useRef<HTMLButtonElement>(null);
  const sellRef = useRef<HTMLButtonElement>(null);

  const tabHandler = (e: React.MouseEvent<HTMLButtonElement>) => {

    const target = e.target as HTMLButtonElement;
    if (buyRef.current && target.className !== buyRef.current.className) {
      target.className = "tab tab--active";
      buyRef.current.className = "tab";
      setIsBuy(false);
    } else if (sellRef.current) {
      target.className = "tab tab--active";
      sellRef.current.className = "tab";
      setIsBuy(true);
    }
  }

  const buyHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch);
    setPrice(0);
    setAmount(0);
  }

  const sellHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    makeSellOrder(provider, exchange, tokens, { amount, price }, dispatch);
    setPrice(0);
    setAmount(0);
  }

  return (
    <div className="component exchange__orders">
      <div className="component__header flex-between">
        <h2>New Order</h2>
        <div className="tabs">
          <button onClick={tabHandler} ref={buyRef} className="tab tab--active">Buy</button>
          <button onClick={tabHandler} ref={sellRef} className="tab">Sell</button>
        </div>
      </div>

      <form onSubmit={isBuy ? (e) => buyHandler(e) : (e) => sellHandler(e)}>

        {
          isBuy ? (
            <label htmlFor="amount">Buy Amount</label>
          ) : (
            <label htmlFor="amount">Sell Amount</label>
          )
        }


        <input
          type="text"
          id="amount"
          placeholder="0.000"
          value={amount === 0 ? '' : amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        {
          isBuy ? (
            <label htmlFor="price">Buy Price</label>
          ) : (
            <label htmlFor="price">Sell Price</label>
          )
        }

        <input
          type="text"
          id="price"
          placeholder="0.000"
          value={price === 0 ? '' : price}
          onChange={(e) => setPrice(Number(e.target.value))} />

        <button className="button button--filled" type="submit" >
          {
            isBuy ? <span>Buy Now </span> : <span>Sell Now</span>
          }
        </button>
      </form>
    </div>
  )



}

export default Order;