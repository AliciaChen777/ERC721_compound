// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract erc721 is ERC721 {

    constructor(uint256  tokenId, string memory tokenName, string memory tokenSymbol) ERC721
    (tokenName, tokenSymbol) {
    _mint(msg.sender, tokenId);

    }
}