//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract FishingRod is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

	// Private members
    string public _baseTokenURI;

    // Public members
    uint256 public _maxTokens;   

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        uint256 maxSupply
    ) ERC721(name, symbol) {
        _maxTokens = maxSupply;
        _baseTokenURI = baseURI;
    }
}