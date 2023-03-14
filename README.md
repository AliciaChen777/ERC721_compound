# Objective
###### tags: `blockchain`
## Implement Compound cToken supporting ERC721 token
- This implementation use ERC721 cloneX and ERC20 uni for testing



## Implement pipeline
- Revised Compound protocol
- Add ERC721 token as collateral
- Issue ctoken CERC721 token
- Get ERC721 price and uni price from chain by using chainlink
- use oracle to link chainlink



## Implement method
- contract owner supplies ERC721 cloneX asset as collateral to borrow uni
- In order to support cTokenNFT, write new contract CErc721.sol, CErc721Immutable
- In order to connect to chainlink, write new contract simplePriceOracleChainlink.sol

## Testing method
1. add env api key
2. use this line of cmd to
```npx hardhat test test/get_NFT_price.js --network hardhat```






# 專案
###### tags: `blockchain`
## 實現支援ERC721的compound代幣

## 功能
- 實現支援可用NFT做抵押品的compound代幣
- 本次實現用cloneX 跟uni 做測試


## 思路pipeline
- 從作業寫過的compound架構發展
- 新增ERC721 as collateral
- 發CERC721 token
- 去chainlink 拿ERC721價格, UNI價格
- oracle 接chainlink

## 實現方法
- owner抵押ERC721 cloneX, 借出uni  
- 為了支援發cTokenNFT, 寫新contract CErc721.sol, CErc721Immutable
- 為了接chainlink, 寫新contract simplePriceOracleChainlink.sol

## 測試方法
1. 將env api key們加上
2. 下測試指令
```npx hardhat test test/get_NFT_price.js --network hardhat```

