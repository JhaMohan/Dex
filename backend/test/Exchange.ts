import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const etherValue = (n: number) => {
  return ethers.parseUnits(n.toString(), "ether");
}

describe("Exchnage", () => {

  const deployFixture = async () => {

    let feePercent = 10;
    const name = "USDC";
    const symbol = "USDC";
    const name2 = "DAI";
    const symbol2 = "DAI";
    const totalSupply = 1000000;
    const [deployer, feeAccount, user1, user2] = await ethers.getSigners();
    const exchange = await ethers.deployContract("Exchange", [feeAccount.address, feePercent]);
    await exchange.waitForDeployment();
    const token = await ethers.deployContract("Token", [name, symbol, totalSupply]);
    await token.waitForDeployment();
    const token2 = await ethers.deployContract("Token", [name2, symbol2, totalSupply]);
    await token2.waitForDeployment();
    const transferTransaction = await token.transfer(user1.address, etherValue(1000));
    await transferTransaction.wait();
    return { exchange, token, token2, feeAccount, feePercent, deployer, user1, user2 };
  }


  describe("Deployment", () => {
    it("tracks the fee account", async () => {
      const { exchange, feeAccount } = await loadFixture(deployFixture);
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    })
    it("tracks the fee percent", async () => {
      const { exchange, feeAccount, feePercent } = await loadFixture(deployFixture);
      expect(await exchange.feePercent()).to.equal(feePercent);
    })
  });

  describe("Depositing Token", () => {
    let amount = etherValue(100);
    const depositToExchange = async () => {
      const { exchange, token, deployer, user1 } = await loadFixture(deployFixture);
      const tokenApprove = await token.approve(exchange.getAddress(), amount);
      await tokenApprove.wait();
      const transaction = await exchange.depositToken(token.getAddress(), amount);
      const receipt: any = await transaction.wait();
      return { token, exchange, deployer, user1, receipt }
    }

    describe("Success", () => {
      it("Deposite tokens", async () => {
        const { token, exchange, deployer } = await loadFixture(depositToExchange);
        expect(await token.balanceOf(exchange.getAddress())).to.eq(amount);
        expect(await exchange.tokens(token.getAddress(), deployer.address)).to.eq(amount);
        expect(await exchange.balanceOf(token.getAddress(), deployer.address)).to.eq(amount);
      })

      it('emit an deposit event', async () => {
        const { token, exchange, deployer, receipt } = await loadFixture(depositToExchange);
        expect(receipt).to.emit(exchange, "Deposit");
        // console.log(receipt?.logs[0]?.fragment?.name);
        // console.log(receipt?.logs[1]);
        expect(receipt?.logs[1]?.args[0]).to.equal(await token.getAddress());
        expect(receipt?.logs[1]?.args[1]).to.equal(deployer.address);
        expect(receipt?.logs[1]?.args[2].toString()).to.equal(amount);
      })

    })
    describe("Failure", () => {
      it("failed when no token approved", async () => {
        const { token, exchange, user1 } = await loadFixture(depositToExchange);
        await expect(exchange.connect(user1).depositToken(token.getAddress(), amount)).to.be.rejected;
      })
    })
  })

  describe("Withdraw Token", () => {
    let depositAmount = etherValue(1000);
    let withdrawAmount = etherValue(100);
    const withdrawToExchange = async () => {
      const { exchange, token, deployer, user1 } = await loadFixture(deployFixture);
      const tokenApprove = await token.connect(user1).approve(exchange.getAddress(), depositAmount);
      await tokenApprove.wait();
      const transaction = await exchange.connect(user1).depositToken(token.getAddress(), depositAmount);
      const depositReceipt: any = await transaction.wait();
      const WithdrawTransaction = await exchange.connect(user1).withdrawToken(token.getAddress(), withdrawAmount);
      const withdrawReceipt: any = await WithdrawTransaction.wait();
      return { token, exchange, deployer, user1, depositReceipt, withdrawReceipt }
    }

    describe("Success", () => {
      it("Deposite tokens", async () => {
        const { token, exchange, user1 } = await loadFixture(withdrawToExchange);
        expect(await token.balanceOf(exchange.getAddress())).to.eq(depositAmount - withdrawAmount);
        expect(await exchange.tokens(token.getAddress(), user1.address)).to.eq(depositAmount - withdrawAmount);
      })

      it('emit an deposit event', async () => {
        const { token, exchange, deployer, user1, withdrawReceipt } = await loadFixture(withdrawToExchange);
        expect(withdrawReceipt).to.emit(exchange, "Withdraw");
        // console.log(receipt?.logs[0]?.fragment?.name);
        // console.log(withdrawReceipt?.logs[1]);
        expect(withdrawReceipt?.logs[1]?.args[0]).to.equal(await token.getAddress());
        expect(withdrawReceipt?.logs[1]?.args[1]).to.equal(user1.address);
        expect(withdrawReceipt?.logs[1]?.args[2].toString()).to.equal(withdrawAmount);
      })

    })
    describe("Failure", () => {
      it("fails for insufficient balances", async () => {
        const { token, exchange } = await loadFixture(withdrawToExchange);
        await expect(exchange.withdrawToken(token.getAddress(), depositAmount)).to.be.rejected;
      })
    })
  })

  describe("Checking Balances", () => {
    let amount = etherValue(10);
    const depositBalanceToExchange = async () => {
      const { exchange, token, deployer, user1 } = await loadFixture(deployFixture);
      const tokenApprove = await token.approve(exchange.getAddress(), amount);
      await tokenApprove.wait();
      const transaction = await exchange.depositToken(token.getAddress(), amount);
      const receipt: any = await transaction.wait();
      return { token, exchange, deployer, user1, receipt }
    }

    it("return user balance", async () => {
      const { token, exchange, deployer } = await loadFixture(depositBalanceToExchange);
      expect(await token.balanceOf(exchange.getAddress())).to.eq(amount);
      expect(await exchange.tokens(token.getAddress(), deployer.address)).to.eq(amount);
    })


  })

  describe("Making orders", async () => {
    let amount = etherValue(10);
    const makeOrder = async () => {
      const { exchange, token, token2, deployer, user1 } = await loadFixture(deployFixture);
      const tokenApprove = await token2.approve(exchange.getAddress(), amount);
      await tokenApprove.wait();
      const transaction = await exchange.depositToken(token2.getAddress(), amount);
      await transaction.wait();
      const makeOrderTransaction = await exchange.makeOrder(token, etherValue(10), token2, etherValue(10));
      const makeOrderTransactionReceipt: any = await makeOrderTransaction.wait();

      return { exchange, token, token2, user1, deployer, makeOrderTransactionReceipt };
    }

    describe("Success", async () => {
      it("tracks newly created recored", async () => {
        const { exchange } = await loadFixture(makeOrder);
        expect(await exchange.orderCount()).to.eq(1);
      })

      it("emit Order event", async () => {
        const { exchange, makeOrderTransactionReceipt, deployer, token, token2 } = await loadFixture(makeOrder);
        expect(makeOrderTransactionReceipt).to.emit(exchange, "Order");
        // console.log(receipt?.logs[0]?.fragment?.name);
        // console.log(receipt?.logs[1]);
        expect(makeOrderTransactionReceipt?.logs[0]?.args[0]).to.equal(1);
        expect(makeOrderTransactionReceipt?.logs[0]?.args[1]).to.equal(deployer.address);
        expect(makeOrderTransactionReceipt?.logs[0]?.args[2].toString()).to.equal(await token.getAddress());
        expect(makeOrderTransactionReceipt?.logs[0]?.args[3].toString()).to.equal(etherValue(10));
        expect(makeOrderTransactionReceipt?.logs[0]?.args[4].toString()).to.equal(await token2.getAddress());
        expect(makeOrderTransactionReceipt?.logs[0]?.args[5].toString()).to.equal(etherValue(10));

      })
    })
    describe("Failure", async () => {
      it("Rejects with no balance", async () => {
        const { exchange, makeOrderTransactionReceipt, deployer, token, token2 } = await loadFixture(makeOrder);
        await expect(exchange.makeOrder(token2, amount, token, amount)).to.be.reverted;
      });
    })
  })


  describe("Order actions", async () => {
    let amount = etherValue(10);
    let amount2 = etherValue(20)
    const makeOrder = async () => {
      const { exchange, token, token2, deployer, user1, user2, feeAccount } = await loadFixture(deployFixture);
      const tokenApprove = await token2.approve(exchange.getAddress(), amount);
      await tokenApprove.wait();
      const transaction = await exchange.depositToken(token2.getAddress(), amount);
      await transaction.wait();
      const transferTokenToUser2 = await token2.transfer(user2.address, etherValue(100));
      await transferTokenToUser2.wait();
      const tokenApproveUser2 = await token2.connect(user2).approve(exchange.getAddress(), amount2);
      await tokenApproveUser2.wait();
      const transactionUser2 = await exchange.connect(user2).depositToken(token2.getAddress(), amount2);
      await transactionUser2.wait();
      const transferTokenToUser1 = await token.transfer(user1.address, etherValue(100));
      await transferTokenToUser1.wait();
      const tokenApproveUser1 = await token.connect(user1).approve(exchange.getAddress(), amount);
      await tokenApproveUser1.wait();
      const transactionUser1 = await exchange.connect(user1).depositToken(token.getAddress(), amount);
      await transactionUser1.wait();
      const makeOrderTransaction = await exchange.makeOrder(token, etherValue(10), token2, etherValue(10));
      const makeOrderTransactionReceipt: any = await makeOrderTransaction.wait();
      const makeOrderTransaction2 = await exchange.connect(user1).makeOrder(token2, etherValue(10), token, etherValue(10));
      const makeOrderTransactionReceipt2: any = await makeOrderTransaction2.wait();

      return { exchange, token, token2, user1, user2, feeAccount, deployer, makeOrderTransactionReceipt };
    }
    describe("Cancelling orders", async () => {
      const cancelOrder = async () => {
        const { exchange, token, token2, user1, deployer } = await loadFixture(makeOrder);
        const cancelOrderTransaction = await exchange.cancelOrder(1);
        const cancelOrderTransactionReceipt: any = await cancelOrderTransaction.wait();
        return { exchange, token, token2, user1, deployer, cancelOrderTransactionReceipt }
      }
      describe("Success", async () => {
        it("update cancelled order", async () => {
          const { exchange } = await loadFixture(cancelOrder);
          expect(await exchange.orderCancelled(1)).to.eq(true);
        })

        it("emits an event", async () => {
          const { exchange, deployer, token, token2, cancelOrderTransactionReceipt } = await loadFixture(cancelOrder);
          expect(cancelOrderTransactionReceipt).to.emit(exchange, "Cancel");
          // console.log(cancelOrderTransactionReceipt?.logs[0]);
          expect(cancelOrderTransactionReceipt?.logs[0]?.args[0]).to.eq(1);
          expect(cancelOrderTransactionReceipt?.logs[0]?.args[1]).to.eq(deployer.address);
          expect(cancelOrderTransactionReceipt?.logs[0]?.args[2]).to.eq(await token.getAddress());
          expect(cancelOrderTransactionReceipt?.logs[0]?.args[3]).to.eq(amount);
          expect(cancelOrderTransactionReceipt?.logs[0]?.args[4]).to.eq(await token2.getAddress());
          expect(cancelOrderTransactionReceipt?.logs[0]?.args[5]).to.eq(amount);
        })

      })
      describe("Failure", async () => {
        it("rejects invalid order ids", async () => {
          const { exchange, deployer, token, token2, cancelOrderTransactionReceipt } = await loadFixture(cancelOrder);
          await expect(exchange.cancelOrder(99)).to.be.reverted;
        })

        it("rejects unauthorized cancelations", async () => {
          const { exchange, user1 } = await loadFixture(makeOrder);
          await expect(exchange.connect(user1).cancelOrder(1)).to.be.rejected;
        })
      })
    })

    describe("Filling Order", async () => {
      const fillOrderFixture = async () => {
        const { exchange, token, token2, user1, user2, deployer, feeAccount } = await loadFixture(makeOrder);
        const transaction = await exchange.connect(user2).fillOrder(2);
        const transactionReceipt: any = await transaction.wait();
        return { exchange, token, token2, user1, user2, deployer, feeAccount, transactionReceipt }
      }

      describe("Success", async () => {
        it("execute the trades and charge fees", async () => {
          const { exchange, token, token2, user1, user2, deployer, feeAccount } = await loadFixture(fillOrderFixture);
          const tokenAddress = await token.getAddress();
          const token2Address = await token2.getAddress();
          // Token Give
          expect(await exchange.balanceOf(tokenAddress, user1.address)).to.be.equal(0);
          expect(await exchange.balanceOf(tokenAddress, user2.address)).to.be.equal(etherValue(10));
          expect(await exchange.balanceOf(tokenAddress, feeAccount.address)).to.be.equal(0);

          // Token Get
          expect(await exchange.balanceOf(token2Address, user1.address)).to.be.equal(etherValue(10));
          expect(await exchange.balanceOf(token2Address, user2.address)).to.be.equal(etherValue(9));
          expect(await exchange.balanceOf(token2Address, feeAccount.address)).to.be.equal(etherValue(1));
        })

        it("emits an event", async () => {
          const { exchange, deployer, user1, user2, token, token2, transactionReceipt } = await loadFixture(fillOrderFixture);
          expect(transactionReceipt).to.emit(exchange, "Trade");
          // console.log(cancelOrderTransactionReceipt?.logs[0]);
          expect(transactionReceipt?.logs[0]?.args[0]).to.eq(2);
          expect(transactionReceipt?.logs[0]?.args[1]).to.eq(user2.address);
          expect(transactionReceipt?.logs[0]?.args[2]).to.eq(await token2.getAddress());
          expect(transactionReceipt?.logs[0]?.args[3]).to.eq(amount);
          expect(transactionReceipt?.logs[0]?.args[4]).to.eq(await token.getAddress());
          expect(transactionReceipt?.logs[0]?.args[5]).to.eq(amount);
        })

        it("updates fills order", async () => {
          const { exchange } = await loadFixture(fillOrderFixture);
          expect(await exchange.orderFilled(2)).to.eq(true);
        })
      })

      describe("Failure", async () => {
        it("reject already filled order", async () => {
          const { exchange, user2 } = await loadFixture(fillOrderFixture);
          await expect(exchange.connect(user2).fillOrder(2)).to.be.reverted;
        });

        it("reject cancel order", async () => {
          const { exchange, user2, deployer } = await loadFixture(fillOrderFixture);
          const result = await exchange.cancelOrder(1);
          await result.wait();
          await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;

        });

        it("reject invalid order", async () => {
          const { exchange, user2 } = await loadFixture(fillOrderFixture);
          await expect(exchange.connect(user2).fillOrder(10)).to.be.reverted;
        });

      })



    })
  })



})