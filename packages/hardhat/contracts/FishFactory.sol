//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract FishFactory is ERC721Enumerable, Ownable {
	
	struct Fish {
		string name;
		uint birth;
		bytes32 gameTraits;
		bytes32 visualTraits;
	}

	// Private members
	mapping(uint256 => Fish) private m_FishDetails;


	// Public members
	string public _baseTokenURI;
	uint public randCounter = 0;

	constructor(string memory baseURI) ERC721("Fish", "FSH") {
		_baseTokenURI = baseURI;
	}

	function getContractBalance() public view returns(uint256 _balance){
		uint256 contractBalance = address(this).balance;
		return contractBalance;
	}

	function createFish(string memory name) private returns(uint){
		uint mintIndex = totalSupply();
		uint256 timeOfMint = block.timestamp;
		bytes32 gameTraits = perCallRandomGeneration();
		bytes32 visualTraits = perCallRandomGeneration();
		_safeMint(msg.sender, mintIndex);
		m_FishDetails[mintIndex] = Fish(name, timeOfMint, gameTraits, visualTraits);
		return mintIndex;
	}

	function diceRoll() public returns(uint) {
		bytes32 rollTheDice = perCallRandomGeneration();
		uint diceNum = uint(rollTheDice) % 16; // random number 1-16
		return diceNum;
	}

	function catchFish(string memory name) public payable returns(uint){
		uint randomNum = uint256(perCallRandomGeneration()) % 1000; // random number 1-1000
		// mint chance based on amount spent to mint
		if(msg.value >= 100 * 10**18) { // 100 ONE, guaranteed mint
			return createFish(name);
		} else if(msg.value >= 50 * 10**18 && randomNum < 250 ) { // 50 ONE, ~25% chance to mint
			return createFish(name);
		} else if(msg.value >= 25 * 10**18 && randomNum < 63) { // 25 ONE, ~6.25% chance to mint
			return createFish(name);
		} else if(msg.value >= 5 * 10**18 && randomNum < 13) { // 5 ONE, ~1.25% chance to mint
			return createFish(name);
		} else {
			return 0;
		}
	}

	function getFishInfo(uint256 tokenId) public view returns(Fish memory info) {
		require(_exists(tokenId), "That fish has not been minted yet.");
		return m_FishDetails[tokenId];
	}

	function perCallRandomGeneration() public returns(bytes32) {
		bytes32 random = vrf() & keccak256(abi.encodePacked(randCounter));
		randCounter += 1;
		return random;
	}

	function vrf() public view returns (bytes32 result) {
	bytes32 input;
	assembly {
		let memPtr := mload(0x40)
		if iszero(staticcall(not(0), 0xff, input, 32, memPtr, 32)) {
			invalid()
		}
		result := mload(memPtr)
	}
}
}