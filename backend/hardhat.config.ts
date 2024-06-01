import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {

  // solidity: "0.8.24",
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  solidity: {
    compilers: [{
      version: "0.8.24"
    }]
  }
};

export default config;
