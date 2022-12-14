// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "./PriceOracle.sol";
import "./CErc20.sol";
import "./IOracle.sol";

contract SimplePriceOracleChainlink is PriceOracle {
    mapping(address => address) oracleAddress;
    mapping(address => uint256) prices;
    event PricePosted(
        address asset,
        uint256 previousPriceMantissa,
        uint256 requestedPriceMantissa,
        uint256 newPriceMantissa
    );

    function _getUnderlyingAddress(CToken cToken)
        private
        view
        returns (address)
    {
        address asset;
        if (compareStrings(cToken.symbol(), "cETH")) {
            asset = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
        } else {
            asset = address(CErc20(address(cToken)).underlying());
        }

        return asset;
    }

    function getUnderlyingPrice(CToken cToken)
        public
        view
        override
        returns (uint256)
    {
        address priceAddress = oracleAddress[address(cToken)];
        IOracle oracle = IOracle(priceAddress);

        (, int256 price, , , ) = oracle.latestRoundData();
        return uint256(price);
    }

    //TODO: 記得放入報價地址
    function setOracleAddress(address cToken, address _oracleAddress) public {
        oracleAddress[cToken] = _oracleAddress;
    }

    function setDirectPrice(address asset, uint256 price) public {
        emit PricePosted(asset, prices[asset], price, price);
        prices[asset] = price;
    }

    // v1 price oracle interface for use as backing of proxy
    function assetPrices(address asset) external view returns (uint256) {
        return prices[asset];
    }

    function compareStrings(string memory a, string memory b)
        internal
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }
}
