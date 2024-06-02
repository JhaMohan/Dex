import { ethers } from "hardhat";

async function main() {
    console.log("Preparing for deployment.......");

    const accounts = await ethers.getSigners();
    console.log(`Account fetched:\n ${accounts[0].address} \n ${accounts[1].address} \n ${accounts[2].address}`);


    const pulsetoken = await ethers.deployContract("Token", ["Pulse Token", "PT", 1000000]);
    await pulsetoken.waitForDeployment();
    console.log(`Pulse Token deployed to:  ${pulsetoken.target}`);

    const mETH = await ethers.deployContract("Token", ["mETH", "mETH", 1000000]);
    await mETH.waitForDeployment();
    console.log(`mEth Token deployed to:  ${mETH.target}`)

    const mDAI = await ethers.deployContract("Token", ["mDAI", "mDAI", 1000000]);
    await mDAI.waitForDeployment();
    console.log(`mDAI Token deployed to:  ${mDAI.target}`)


    const exchange = await ethers.deployContract("Exchange", [accounts[1].address, 10]);
    await exchange.waitForDeployment();
    console.log(`Exchange deployed to:  ${exchange.target}`)

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});