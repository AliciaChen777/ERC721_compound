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
    let azuki;
    const nft_addr = "0x21f73D42Eb58Ba49dDB685dc29D3bF5c0f0373CA"

    it("TEST Mint", async function () {
        [owner, addr1] = await ethers.getSigners();
        console.log(1, 2, 3, 4);
        console.log(owner.address);
        const latestBlock = (await hre.ethers.provider.getBlock("latest")).number
        console.log('block num: ', latestBlock)
    })

    it('deploy chainlink', async function(){
        nftChainLink = await ethers.getContractFactory("NFTFloorPriceConsumerV3");
        
        nftChainLink = await nftChainLink.deploy();

        console.log('nftChainLink addr', nftChainLink.address)

    })
    it('test nft price',async function(){
        
        console.log(await nftChainLink.getLatestPrice());

    })

    it("impersonate", async function(){
        
        await impersonateAccount(nft_addr);
        nft_owner = await ethers.getSigner(nft_addr);
        console.log('hardhat owner:', owner.address)
        console.log('nft_owner:', nft_owner.address)

    })
    it('approve transfer nft', async function(){
        //approve(address to, uint256 tokenId)
        //uni.connect(binance).transfer(owner.address, UNIAmount);
        azuki = await ethers.getContractAt("ERC721", nft_addr)
        //usdc = await ethers.getContractAt("ERC20", usdcAddress);

        // Deploy the contract
        
        console.log("azuki.address ",azuki.address)    
    })

})