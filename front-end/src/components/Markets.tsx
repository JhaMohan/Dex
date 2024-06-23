import config from '../config.json'
import React, { ChangeEvent } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { loadTokens } from '../redux/interaction';


const Markets: React.FC = () => {
  const dispatch = useAppDispatch();
  const chainId = useAppSelector((state) => state.provider.chainId);
  const provider = useAppSelector((state) => state.provider.connection);

  const marketHandler = async (e: ChangeEvent<HTMLSelectElement>) => {
    const addresses = e.target.value.split(',');
    await loadTokens(provider, addresses, dispatch);
  }
  return (
    <div className="component exchange__markets">
      <div className="component__header">
        <h2>Select Market</h2>
      </div>
      {chainId && config[chainId as keyof typeof config] ? (
        <select name="markets" id="markets" onChange={(e) => marketHandler(e)}>
          <option value={`${config[chainId as keyof typeof config].pulseToken.address},${config[chainId as keyof typeof config].mETH.address}`}>PT / mETH</option>
          <option value={`${config[chainId as keyof typeof config].pulseToken.address},${config[chainId as keyof typeof config].mDAI.address}`}>PT / mDAI</option>
        </select>
      ) : (
        <div>
          Not deployed to network.
        </div>
      )
      }

      <hr></hr>
    </div >
  );
}

export default Markets;