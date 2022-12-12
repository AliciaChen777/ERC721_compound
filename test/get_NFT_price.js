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
    let azuki_holder = '0x5d7aaa862681920ea4f350a670816b0977c80b37';
    //const nft_addr = "0x21f73D42Eb58Ba49dDB685dc29D3bF5c0f0373CA"
    let azuki_nft = '0xED5AF388653567Af2F388E6224dC7C4b3241C544'
    let decimals = 18;
    it("TEST Mint", async function () {
        [owner, addr1] = await ethers.getSigners();
        console.log(1, 2, 3, 4);
        console.log(owner.address);
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
    // it('approve transfer nft', async function(){
    //     //approve(address to, uint256 tokenId)
    //     //uni.connect(binance).transfer(owner.address, UNIAmount);
    //     azuki = await ethers.getContractAt("ERC721", nft_addr)
    //     //usdc = await ethers.getContractAt("ERC20", usdcAddress);

    //     // Deploy the contract

    //     console.log("azuki.address ",azuki.address)    
    //     const nft_owner = await azuki.ownerOf();
    //     console.log('nft_owner',nft_owner)
    //})

    //it("impersonate", async function () {

    //     await ethers.getContractAt("ERC721", azuki_nft)
    //     await impersonateAccount(azuki_holder);
    //     azuki = await ethers.getSigner(azuki_holder);


    //     console.log('hardhat owner:', owner.address)
    //     console.log('nft_owner:', azuki.address)

    // })

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
        // let Oracle = await ethers.getContractFactory("SimplePriceOracle");
        // oracle = await Oracle.deploy();





        cTokenNFT = await cerc721.deploy(
            azuki_nft,
            comptroller.address,
            interestRateModel.address,
            2,
            'NFT_name',
            'NFT_symbol',
            decimals,
            owner.address
        );
        await cTokenNFT.deployed();
        console.log('cTokenNFT addr', cTokenNFT.address)


        let azuki_instance = await ethers.getContractAt("ERC721", azuki_nft)
        await impersonateAccount(azuki_holder);
        azuki = await ethers.getSigner(azuki_holder);








    })




})