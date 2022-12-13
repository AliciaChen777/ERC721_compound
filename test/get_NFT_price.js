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
    let owner, addr1;
    let nftChainLink;
    let clonex_holder = '0xbad1990c2967231bc9a4fa9562ea68e65dd2b25d';
    let clonex_nft = '0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B'
    let decimals = 18;
    it("TEST Mint", async function () {
        [owner, addr1] = await ethers.getSigners();
        console.log(1, 2, 3, 4);
        console.log('owner add', owner.address);
        const latestBlock = (await hre.ethers.provider.getBlock("latest")).number
        console.log('block num: ', latestBlock)
    })

    it('deploy chainlink', async function () {
        nftChainLink = await ethers.getContractFactory("NFTFloorPriceConsumerV3");

        nftChainLink = await nftChainLink.deploy();

        console.log('nftChainLink addr', nftChainLink.address)

    })
    it('test nft price', async function () {

        console.log(await nftChainLink.getLatestPrice());

    })



    it("deploy Cerc721", async function () {
        let cerc721 = await ethers.getContractFactory("CErc721Immutable");
        //cerc721 = await cerc721.deploy()
        // create interest model
        let InterestRateModel = await ethers.getContractFactory(
            "WhitePaperInterestRateModel"
        );
        interestRateModel = await InterestRateModel.deploy(1, 1);

        // //create comptroller
        Comptroller = await ethers.getContractFactory("Comptroller");
        comptroller = await Comptroller.deploy();

        // //create oracel
        let Oracle = await ethers.getContractFactory("SimplePriceOracle");
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

        let tokenId = 9791
        let clonex_instance = await ethers.getContractAt("ERC721", clonex_nft)
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




        let tokenNFTPrice = BigInt(100 * 1e18);
        let collateralFactorNFT = BigInt(0.5 * 1e18);
        //liquidate factor
        let closeFactor = BigInt(0.5 * 1e18);
        //await oracle.setUnderlyingPrice(cTokenA.address, tokenAPrice);

        await oracle.setUnderlyingPrice(cTokenNFT.address, tokenNFTPrice);
        //support market
        //await comptroller._supportMarket(cTokenA.address);
        await comptroller._supportMarket(cTokenNFT.address);
        //set oracle
        await comptroller._setPriceOracle(oracle.address);
        //set collateral
        //await comptroller._setCollateralFactor(cTokenA.address, collateralFactorA);
        await comptroller._setCollateralFactor(cTokenNFT.address, collateralFactorNFT);
        // set close factor
        await comptroller._setCloseFactor(closeFactor);
        // set liquidation incentive
        //await comptroller._setLiquidationIncentive(liquidationIncentive);
        // token B



        //owner提交clonex_nft給compound 成為抵押品
        await cTokenNFT.connect(owner).mint_721(tokenId, 1);
        console.log('await cTokenNFT.balanceOf(owner.address) =', await cTokenNFT.balanceOf(owner.address))

    })




})