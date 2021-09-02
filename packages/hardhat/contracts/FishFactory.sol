//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract FishFactory is ERC721Enumerable, Ownable {
	
	struct Fish {
		uint8 fishTypeIndex;
		string name;
		uint birth;
		uint8 strength;
		uint8 intelligence;
		uint8 agility;
		bytes32 traitsA;
		bytes32 traitsB;
		bytes32 traitsC;
	}

	// Private members
	mapping(uint256 => Fish) private m_FishDetails;
	uint private _randCounter = 0;
	uint8 private _fishTypeIndex = 0;

	// Public members
	string public _baseTokenURI;

	constructor(string memory baseURI) ERC721("Fish", "FSH") {
		_baseTokenURI = baseURI;
	}

	function _baseURI() internal view override returns (string memory) {
		return _baseTokenURI;
	}

	function getContractBalance() public view returns(uint256 _balance){
		uint256 contractBalance = address(this).balance;
		return contractBalance;
	}

	function createFish(string memory name) private returns(uint){
		uint mintIndex = totalSupply();
		uint256 timeOfMint = block.timestamp;
		bytes32 traits1 = perCallRandomGeneration();
		bytes32 traits2 = perCallRandomGeneration();
		bytes32 traits3 = perCallRandomGeneration();
		uint8 strength = uint8(uint(traits1) % 256);
		uint8 intelligence = uint8(uint(traits2) % 256);
		uint8 agility = uint8(uint(traits3) % 256);
		_safeMint(msg.sender, mintIndex);
		m_FishDetails[mintIndex] = Fish(_fishTypeIndex, name, timeOfMint, strength, intelligence, agility, traits1, traits2, traits3);
		return mintIndex;
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

	// TODO Add onlyOwner functions to update baseURI
	// TODO Add onlyOwner functions to withdraw from contract with splitable


	function getFishInfo(uint256 tokenId) public view returns(Fish memory info) {
		require(_exists(tokenId), "That fish has not been minted yet.");
		return m_FishDetails[tokenId];
	}

	function perCallRandomGeneration() private returns(bytes32) {
		_randCounter += 1;
		return vrf() & keccak256(abi.encodePacked(_randCounter));
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