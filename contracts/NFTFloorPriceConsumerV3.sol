// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./AggregatorV3Interface.sol";

contract NFTFloorPriceConsumerV3 {
    AggregatorV3Interface internal nftFloorPriceFeed;

    /**
     * Network: eth mainnet
     * Aggregator: Azuki
     * Address: 0xA8B9A447C73191744D5B79BcE864F343455E1150
     * Block: 15969440
     */
    constructor() {
        nftFloorPriceFeed = AggregatorV3Interface(
            0xA8B9A447C73191744D5B79BcE864F343455E1150
        
        );
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int) {
        (
            ,
            /*uint80 roundID*/ int256 nftFloorPrice /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
            ,
            ,

        ) = nftFloorPriceFeed.latestRoundData();
        return nftFloorPrice;
    }
}
