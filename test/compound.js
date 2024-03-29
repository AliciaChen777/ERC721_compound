const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Logger, LogLevel } = require("@ethersproject/logger");

Logger.setLogLevel(LogLevel.ERROR);

let cerc20, tokenA, tokenB, cTokenA, cTokenB;
let unitroller, Comptroller, comptroller, interestRateModel, oracle;

let tokenAmount = BigInt(1000 * 1e18);
let supplyAmount = BigInt(100 * 1e18);

let tokenBAmount = BigInt(1 * 1e18);
let borrowAmount_A_from_B = BigInt(50 * 1e18);

let decimals = 18;
let nameA = "CTokenA";
let symbolA = "CTA";
let nameB = "CTokenB";
let symbolB = "CTB";
// change rate = 1:1
let changeRateA = BigInt(1 * 1e18);
let changeRateB = BigInt(1 * 1e18);
let tokenAPrice = BigInt(1 * 1e18);
let newTokenAPrice = BigInt(1.5 * 1e18);
let tokenBPrice = BigInt(100 * 1e18);
let collateralFactorA = BigInt(0.9 * 1e18);
let collateralFactorB = BigInt(0.5 * 1e18);
let chagnedCollateralFactorB = BigInt(0.4 * 1e18);

//liquidate factor
let closeFactor = BigInt(0.5 * 1e18);
let liquidationIncentive = BigInt(1.08 * 1e18);

async function deployContracts() {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // create tokenA & tokenB
    let Erc20 = await ethers.getContractFactory("ERC20_custom");
    tokenA = await Erc20.deploy("TokenA", "TOA");
    tokenB = await Erc20.deploy("TokenB", "TOB");

    // create interest model
    let InterestRateModel = await ethers.getContractFactory(
        "WhitePaperInterestRateModel"
    );
    interestRateModel = await InterestRateModel.deploy(0, 0);

    //create comptroller
    Comptroller = await ethers.getContractFactory("Comptroller");
    comptroller = await Comptroller.deploy();

    //create oracel
    let Oracle = await ethers.getContractFactory("SimplePriceOracle");
    oracle = await Oracle.deploy();

    // proxy setting (set unitroller & comptroller)
    //let Unitroller = await ethers.getContractFactory("Unitroller");
    //unitroller = await Unitroller.deploy();

    //await unitroller._setPendingImplementation(comptroller.address);
    //await unitroller._acceptImplementation();

    //await comptroller._become(unitroller.address);

    //comptroller = await Comptroller.attach(unitroller.address); // comptroller is a proxy => using unitroller address but use comptroller abi

    // create cTokenA & cTokenB
    let cerc20 = await ethers.getContractFactory("CErc20Immutable"); 
    
    //let delegator = await ethers.getContractFactory("CErc20Delegator"); // proxy contract
    cTokenA = await cerc20.deploy(
        tokenA.address,
        comptroller.address,
        interestRateModel.address,
        changeRateA,
        nameA,
        symbolA,
        decimals,
        owner.address,
    
    
    );
    await cTokenA.deployed();

    cTokenB = await cerc20.deploy(
        tokenB.address,
        comptroller.address,
        interestRateModel.address,
        changeRateB,
        nameB,
        symbolB,
        decimals,
        owner.address,
        

    );

    await cTokenB.deployed();





}

async function setcomptroller() {
    //set oracle first, otherwise comptroller._setCollateralFactor will revert
    await oracle.setUnderlyingPrice(cTokenA.address, tokenAPrice);
    await oracle.setUnderlyingPrice(cTokenB.address, tokenBPrice);
    //support market
    await comptroller._supportMarket(cTokenA.address);
    await comptroller._supportMarket(cTokenB.address);
    //set oracle
    await comptroller._setPriceOracle(oracle.address);
    //set collateral
    await comptroller._setCollateralFactor(cTokenA.address, collateralFactorA);
    await comptroller._setCollateralFactor(cTokenB.address, collateralFactorB);
    // set close factor
    await comptroller._setCloseFactor(closeFactor);
    // set liquidation incentive
    await comptroller._setLiquidationIncentive(liquidationIncentive);
    // token B
}

describe("Compound liquidate with change collateral factor", async () => {
    before(async () => {
        await deployContracts();
    });

    describe("Settings", async () => {
        it("ERC20 & CERC20 decimals should be 18", async () => {
            expect(await tokenA.decimals()).to.eq(decimals);
            expect(await cTokenA.decimals()).to.eq(decimals);
        });

        it("admin set oracle & comptroller", async () => {
            await setcomptroller();
        });
    });

    describe("Mint & Redeem", async () => {
        it("mint & approve ERC20", async () => {
            //mint
            await tokenA.mint(tokenAmount);
            //approve
            await tokenA.approve(cTokenA.address, tokenAmount);
        });

        it("mint CErc20", async () => {
            await cTokenA.mint(supplyAmount);
            expect(await cTokenA.balanceOf(owner.address)).to.eq(supplyAmount);
        });

        it("redeem Erc20", async () => {
            await cTokenA.redeem(supplyAmount);
            expect(await cTokenA.balanceOf(owner.address)).to.eq(0);
        });

        it("Owner Erc20 balance should be token amount", async () => {
            expect(await tokenA.balanceOf(owner.address)).to.eq(tokenAmount);
        });
    });

    describe("Borrow & Repay", async () => {
        it("addr1 supply some tokenA for cTokenA", async () => {
            await tokenA.connect(addr1).mint(supplyAmount);
            await tokenA.connect(addr1).approve(cTokenA.address, supplyAmount);
            await cTokenA.connect(addr1).mint(supplyAmount);
            expect(await cTokenA.balanceOf(addr1.address)).to.eq(supplyAmount);
        });

        it("owner mint approve tokenB and mint cTokenB first", async () => {
            await tokenB.mint(tokenBAmount);
            await tokenB.approve(cTokenB.address, tokenBAmount);
            await cTokenB.mint(tokenBAmount);
            expect(await cTokenB.balanceOf(owner.address)).to.eq(tokenBAmount);
        });

        it("enter ctokenB to markets", async () => {
            await comptroller.enterMarkets([cTokenB.address]);
        });

        it("borrow tokenA", async () => {
            await cTokenA.borrow(borrowAmount_A_from_B);
            expect(
                await cTokenA.callStatic.borrowBalanceCurrent(owner.address)
            ).to.eq(borrowAmount_A_from_B);
        });

        it("repay tokenA to contract", async () => {
            let balance = await tokenA.balanceOf(owner.address);
            await cTokenA.repayBorrow(borrowAmount_A_from_B);
            expect(await tokenA.balanceOf(owner.address)).to.eq(
                BigInt(Number(balance) - Number(borrowAmount_A_from_B))
            );

            //liquidity should grater than 0
            let result = await comptroller.getAccountLiquidity(owner.address);
            expect(result[1]).to.gt(0);
        });
    });

    describe("Liquidate_change colletaral factor", async () => {
        it("borrow", async () => {
            await cTokenA.borrow(borrowAmount_A_from_B);
            expect(
                await cTokenA.callStatic.borrowBalanceCurrent(owner.address)
            ).to.eq(borrowAmount_A_from_B);
        });

        it("change collateranl factor", async () => {
            await comptroller._setCollateralFactor(
                cTokenB.address,
                chagnedCollateralFactorB
            );

            let markets = await comptroller.markets(cTokenB.address);
            expect(markets.collateralFactorMantissa).to.eq(
                chagnedCollateralFactorB
            );
        });

        it("addr1 mint & approve token A", async () => {
            await tokenA.connect(addr1).mint(tokenAmount);

            await tokenA.connect(addr1).approve(cTokenA.address, tokenAmount);
            expect(
                await tokenA.allowance(addr1.address, cTokenA.address)
            ).to.eq(tokenAmount);
        });

        it("liquidity should = 0 && short fall should > 0", async () => {
            let result = await comptroller.getAccountLiquidity(owner.address);
            expect(result[1]).to.eq(0);
            expect(result[2]).to.gt(0);
        });

        it("liquidate", async () => {
            let borrowBalance = await cTokenA.callStatic.borrowBalanceCurrent(
                owner.address
            );

            let repayAmount =
                (BigInt(borrowBalance) * closeFactor) / BigInt(1e18);

            // before addr1 ctokenB balance = 0
            expect(await cTokenB.balanceOf(addr1.address)).to.eq(0);

            //協助償還借貸資產，到借出的cToken合約，執行liquidateBorrow，第一個參數為被清算人，第二為協助清算資產數量，第三個為抵押資產的cToken地址
            await cTokenA
                .connect(addr1)
                .liquidateBorrow(owner.address, repayAmount, cTokenB.address);

            // after addr1 ctokenB balance should > 0
            expect(await cTokenB.balanceOf(addr1.address)).to.gt(0);

            // owner current borrow balance should less than origin borrow balance
            expect(
                await cTokenA.callStatic.borrowBalanceCurrent(owner.address)
            ).to.lt(borrowBalance);
        });
    });
});


