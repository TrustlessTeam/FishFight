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
		bytes32 traits;
	}

	// Private members
	mapping(uint256 => Fish) private m_FishDetails;


	// Public members
	string public _baseTokenURI;

	constructor(string memory baseURI) ERC721("Fish", "FSH") {
		_baseTokenURI = baseURI;
	}

	function getContractBalance() public view returns(uint256 _balance){
		uint256 contractBalance = address(this).balance;
		return contractBalance;
	}

	function createFish(string memory name) public payable returns(Fish memory info){
		uint mintIndex = totalSupply();
		uint256 timeOfMint = block.timestamp;
		_safeMint(msg.sender, mintIndex);
		m_FishDetails[mintIndex] = Fish(name, timeOfMint, vrf());
		return m_FishDetails[mintIndex];
	}

	function catchFish(string memory name) public payable returns(Fish memory info){
		bytes32 rollTheDice = vrf();
		uint diceNum = uint(rollTheDice) % 4; // random number 1-100
		// mint chance based on amount spent to mint
		if(msg.value >= 100 * 10**18) { // 100 ONE, guaranteed mint
			return createFish(name);
		} else if(msg.value >= 75 * 10**18 && diceNum > 0) { // 50 ONE, ~80% chance to mint
			return createFish(name);
		} else if(msg.value >= 50 * 10**18 && diceNum > 1) { // 50 ONE, ~80% chance to mint
			return createFish(name);
		} else if(msg.value >= 25 * 10**18 && diceNum > 2) { // 50 ONE, ~80% chance to mint
			return createFish(name);
		} else {
			return Fish("", 0, 0);
		}
	}

	function getFishInfo(uint256 tokenId) public view returns(Fish memory info) {
		require(_exists(tokenId), "That fish has not been minted yet.");
		return m_FishDetails[tokenId];
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