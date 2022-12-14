# 期末專案
###### tags: `blockchain`
## 實現支援ERC721的compound代幣

## 功能
- 實現支援可用NFT做抵押品的compound代幣
- 本次實現用cloneX 跟uni 做測試


## 思路架構
- 從作業寫過的compound架構發展
- 新增ERC721 as collateral
- 發CERC721 token
- 去chainlink 拿ERC721價格, UNI價格
- oracle 接chainlink

## 實現方法
- owner抵押ERC721 cloneX, 借出uni  
- 為了支援發cTokenNFT, 寫新contract CErc721.sol, CErc721Immutable
- 為了接chainlink, 寫新contract simplePriceOracleChainlink.sol

