import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const etherValue = (n: number) => {
    return ethers.parseUnits(n.toString(), "ether");
}

describe("Token", () => {

    const deployFixture = async () => {
        const name = "My Token";
        const symbol = "MT";
        const totalSupply = 1000000;
        const [deployer, user1, exchange] = await ethers.getSigners();
        const token = await ethers.deployContract("Token", [name, symbol, totalSupply]);
        await token.waitForDeployment();
        return { token, deployer, user1, exchange };
    }


    describe("Deployment", () => {
        const name = "My Token";
        const symbol = "MT";
        const decimal = 18;
        const totalSupply = 1000000;

        it("has correct name", async () => {
            const { token } = await loadFixture(deployFixture);

            expect(await token.name()).to.be.equal(name);
        });

        it("has correct symbol", async () => {
            const { token } = await loadFixture(deployFixture);

            expect(await token.symbol()).to.be.equal(symbol);
        })

        it("has correct decimal", async () => {
            const { token } = await loadFixture(deployFixture);

            expect(await token.decimal()).to.be.equal(decimal);
        })

        it("has correct totalSupply", async () => {
            const { token } = await loadFixture(deployFixture);

            // const value = etherValue(1000000);
            expect(await token.totalSupply()).to.equal(etherValue(totalSupply));
        });

        it("has owner correct balance", async () => {
            const { token, deployer } = await loadFixture(deployFixture);

            const balance = await token.balanceOf(deployer.address);
            expect(balance).to.equal(etherValue(totalSupply));
        });
    })

    describe('Sending Token', () => {

        describe('Success', () => {
            let amount = 100;
            const tokenTransfer = async () => {
                const { token, deployer, user1 } = await loadFixture(deployFixture);
                const transaction = await token.transfer(user1, etherValue(amount));
                const receipt: any = await transaction.wait();
                return { token, deployer, user1, receipt, transaction }
            }



            it.skip('transfer token balances', async () => {
                const { token, deployer, user1 } = await loadFixture(deployFixture);
                await expect(token.transfer(user1, etherValue(100))).to.changeTokenBalances(token, [deployer, user1], [-etherValue(100), etherValue(100)]);
            })
            it('transfer token balances', async () => {
                const { token, deployer, user1 } = await loadFixture(tokenTransfer);
                expect(await token.balanceOf(user1.address)).to.equal(etherValue(amount));
            })
            it('emit an transfer event', async () => {
                const { token, receipt, deployer, user1, transaction } = await loadFixture(tokenTransfer);
                expect(receipt).to.emit(token, "Transfer");
                // console.log(receipt?.logs[0]?.fragment?.name);
                // console.log(receipt?.logs[0]?.args);
                expect(receipt?.logs[0]?.args[0]).to.equal(deployer.address);
                expect(receipt?.logs[0]?.args[1]).to.equal(user1.address);
                expect(receipt?.logs[0]?.args[2].toString()).to.equal(etherValue(100).toString());
            })

        })

        describe('Failure', () => {
            it('rejects insufficient balances', async () => {
                const { token, user1 } = await loadFixture(deployFixture);
                await expect(token.transfer(user1.address, etherValue(100000000))).to.be.reverted;
            })

            it('rejects invalid receipient', async () => {
                const { token, user1 } = await loadFixture(deployFixture);
                await expect(token.transfer('0x0000000000000000000000000000000000000000', etherValue(100000000))).to.be.reverted;
            })
        })

    })

    describe("Approving Token", () => {
        let amount = 100;
        const allocateToken = async () => {
            const { token, deployer, exchange } = await loadFixture(deployFixture);
            const transaction = await token.approve(exchange.address, etherValue(amount));
            const receipt: any = await transaction.wait();
            return { token, deployer, exchange, receipt };
        }
        describe("Success", () => {
            it("allocates an allowance for delegated token spending", async () => {
                const { token, deployer, exchange, receipt } = await loadFixture(allocateToken);
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(etherValue(amount));
                expect(receipt).to.emit(token, "Approve");
                expect(receipt?.logs[0]?.args[0]).to.equal(deployer.address);
                expect(receipt?.logs[0]?.args[1]).to.equal(exchange.address);
                expect(receipt?.logs[0]?.args[2].toString()).to.equal(etherValue(100).toString());

            })
        })
        describe("Failure", () => {
            it("rejects invalid spenders", async () => {
                const { token } = await loadFixture(allocateToken);
                await expect(token.approve('0x0000000000000000000000000000000000000000', etherValue(100))).to.be.reverted;
            })
        })
    })

    describe("Delegated token transfer", () => {
        let amount = 1000;
        const delegateTransfer = async () => {
            const { token, deployer, user1, exchange } = await loadFixture(deployFixture);
            const approveTransaction = await token.approve(exchange, etherValue(amount));
            await approveTransaction.wait();
            const transferfromTransaction = await token.connect(exchange).transferFrom(deployer.address, user1.address, etherValue(200));
            const transferfromTransactionReceipt: any = await transferfromTransaction.wait();
            return { token, deployer, exchange, user1, transferfromTransactionReceipt };
        }
        describe("Success", async () => {
            it("transfer token balance", async () => {
                const { token, deployer, exchange, user1 } = await loadFixture(delegateTransfer);
                expect(await token.balanceOf(user1.address)).to.eq(etherValue(200));
                expect(await token.balanceOf(deployer.address)).to.eq(etherValue(999800));
            })

            it("resets the allowance", async () => {
                const { token, deployer, exchange } = await loadFixture(delegateTransfer);
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(etherValue(800));
            })

            it('emit an transfer event', async () => {
                const { token, deployer, user1, transferfromTransactionReceipt } = await loadFixture(delegateTransfer);
                expect(transferfromTransactionReceipt).to.emit(token, "Transfer");
                // console.log(receipt?.logs[0]?.fragment?.name);
                // console.log(transferfromTransactionReceipt?.logs[0]?.args);
                expect(transferfromTransactionReceipt?.logs[0]?.args[0]).to.equal(deployer.address);
                expect(transferfromTransactionReceipt?.logs[0]?.args[1]).to.equal(user1.address);
                expect(transferfromTransactionReceipt?.logs[0]?.args[2].toString()).to.equal(etherValue(200).toString());
            })


        });
        describe("Failure", () => {
            it("sending invalid amount", async () => {
                const { token, deployer, exchange, user1 } = await loadFixture(delegateTransfer);
                const invalidAmount = etherValue(10000);
                await expect(token.connect(exchange).transferFrom(deployer.address, user1.address, invalidAmount)).to.be.reverted;
            })

        })
    })






})