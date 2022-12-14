const {
    expect
} = require('chai')
const {
    ethers
} = require('hardhat')
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const {
    impersonateAccount,
} = require("@nomicfoundation/hardhat-network-helpers");
//import 'hardhat/console.sol'

describe("compound", async function () {
    // get admin addresss
    let owner, payer;
    let nftChainLink, clonex_instance
    let clonex_holder = '0xbad1990c2967231bc9a4fa9562ea68e65dd2b25d';
    let clonex_nft = '0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B'
    let decimals = 18;

    let tokenNFTPrice = BigInt(11 * 1e18);
    let tokenUNIPrice = BigInt(1 * 1e18);
    let collateralFactorNFT = BigInt(0.8 * 1e18);
    //liquidate factor3
    let closeFactor = BigInt(0.5 * 1e18);

    //await oracle.setUnderlyingPrice(cTokenA.address, tokenAPrice);

    let UNIAmount = BigInt(1000 * 1e18);
    let borrowUNIAmount = BigInt(0.5 * 1e18);
    const binanceAddress = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
    const uniAddress = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
    let collateralFactorUNI = BigInt(0.9 * 1e18);
    let liquidationIncentive = BigInt(1.08 * 1e18);
    let cerc721, InterestRateModel;
    let tokenId = 9791;
    let oracle, Oracle, Comptroller, comptroller, cTokenNFT, cTokenUNI;

    it("TEST Mint", async function () {
        [owner, payer] = await ethers.getSigners();

        console.log('owner add', owner.address);
        const latestBlock = (await hre.ethers.provider.getBlock("latest")).number
        console.log('block num: ', latestBlock)
    })

    it('deploy chainlink', async function () {
        nftChainLink = await ethers.getContractFactory("NFTFloorPriceConsumerV3");

        nftChainLink = await nftChainLink.deploy();

        console.log('nftChainLink addr', nftChainLink.address)
        //console.log('nft price:', await nftChainLink.getLatestPrice());

    })
    it('test nft price', async function () {

        console.log('nft price:', await nftChainLink.getLatestPrice());

    })



    it("deploy Cerc721", async function () {
        cerc721 = await ethers.getContractFactory("CErc721Immutable");
        //cerc721 = await cerc721.deploy()
        // create interest model
        InterestRateModel = await ethers.getContractFactory(
            "WhitePaperInterestRateModel"
        );
        interestRateModel = await InterestRateModel.deploy(0, 0);

        // //create comptroller
        Comptroller = await ethers.getContractFactory("Comptroller");
        comptroller = await Comptroller.deploy();

        // //create oracel
        Oracle = await ethers.getContractFactory("SimplePriceOracle");
        oracle = await Oracle.deploy();





        cTokenNFT = await cerc721.deploy(
            clonex_nft,
            comptroller.address,
            interestRateModel.address,
            1,
            'NFT_name',
            'NFT_symbol',
            decimals,
            owner.address
        );
        await cTokenNFT.deployed();
        console.log('cTokenNFT addr', cTokenNFT.address)



        const cErc20Factory = await ethers.getContractFactory("CErc20Immutable");

        cTokenUNI = await cErc20Factory.deploy(
            uniAddress,
            comptroller.address,
            interestRateModel.address,
            ethers.utils.parseUnits("1", 18),
            "CtokenUNI",
            "CUNI",
            18,
            owner.address,
        );
        await cTokenUNI.deployed();

        console.log('cTokenUNI addr', cTokenUNI.address)





        clonex_instance = await ethers.getContractAt("ERC721", clonex_nft)
        await impersonateAccount(clonex_holder);
        clonex_signer = await ethers.getSigner(clonex_holder);
        console.log('clonex_signer.address', clonex_signer.address)
        //轉clonex給owner，讓owner抵押
        await clonex_instance.connect(clonex_signer).transferFrom(clonex_signer.address, owner.address, tokenId);
        //已成功轉給owner
        console.log("clonex_instance.ownerOf(tokenId)", await clonex_instance.ownerOf(tokenId))

        //qpprove clonex instance 準備給ctoken
        // approve 給cerc721合約調用
        // cerc721 address: 0x2bb8b93f585b43b06f3d523bf30c203d3b6d4bd4
        //因為是用immutable布合約的，沒辦法直接cerc721.address
        await clonex_instance.approve('0x2bb8b93f585b43b06f3d523bf30c203d3b6d4bd4', tokenId);
        console.log("finish approve");





        await oracle.setUnderlyingPrice(cTokenNFT.address, tokenNFTPrice);
        await oracle.setUnderlyingPrice(cTokenUNI.address, tokenUNIPrice);
        //support market
        await comptroller._supportMarket(cTokenUNI.address);
        await comptroller._supportMarket(cTokenNFT.address);
        //set oracle
        await comptroller._setPriceOracle(oracle.address);
        //set collateral
        await comptroller._setCollateralFactor(cTokenUNI.address, collateralFactorUNI);
        await comptroller._setCollateralFactor(cTokenNFT.address, collateralFactorNFT);
        // set close factor
        await comptroller._setCloseFactor(closeFactor);
        // set liquidation incentive
        await comptroller._setLiquidationIncentive(liquidationIncentive);
        // token B
    })

    it('supply nft to compound', async function () {
        //owner提交clonex_nft給compound 成為抵押品
        await cTokenNFT.connect(owner).mint_721(tokenId, 1);
        console.log('await cTokenNFT.balanceOf(owner.address) =', await cTokenNFT.balanceOf(owner.address))

    })
    it(' get uni from binance and transfer to payer', async function () {


        uni = await ethers.getContractAt("ERC20", uniAddress);
        await impersonateAccount(binanceAddress);
        binance = await ethers.getSigner(binanceAddress);
        await uni.connect(binance).transfer(payer.address, UNIAmount);
        console.log('uni.balanceOf(payer.address)', await uni.balanceOf(payer.address));
        expect(await uni.balanceOf(payer.address)).to.eq(UNIAmount);


    })
    it('payer supply UNI to compound and get CtokenUNI', async function () {
        //ya
        await uni.connect(payer).approve(cTokenUNI.address, UNIAmount);

        await cTokenUNI.connect(payer).mint(UNIAmount);
        expect(await cTokenUNI.balanceOf(payer.address)).to.eq(UNIAmount);

    })

    it("owner 增加 ctokenNFT 的流動性", async () => {
        await comptroller.enterMarkets([cTokenNFT.address]);
        await comptroller.enterMarkets([cTokenUNI.address]);

    });
    it('owner borrow UNI', async function () {
        //ya
        console.log('owner balance')
        console.log('clonex_instance.balanceOf(owner.address)', await clonex_instance.balanceOf(owner.address))
        console.log('uni.balanceOf(owner.address)', await uni.balanceOf(owner.address))
        console.log('cTokenNFT.balanceOf(owner.address)', await cTokenNFT.balanceOf(owner.address))
        console.log('payer balance')

        console.log('cTokenNFT.balanceOf(payer.address)', await cTokenNFT.balanceOf(payer.address))
        console.log('cTokenUNI:.balanceOf(payer.address)', await cTokenUNI.balanceOf(payer.address))

        await cTokenUNI.connect(owner).borrow(borrowUNIAmount);
        //expect(await uni.balanceOf(owner.address)).to.eq(borrowUNIAmount);




    })
    it('set oracle collateral factor to lower', async function () {
        //go
    })
    it(' payer liquidate  owner debt', async function () {
        //go
    })
    it('set ', async function () {
        //go
    })




})