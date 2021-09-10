//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract FishFactory is ERC721Enumerable, Ownable {
	using Counters for Counters.Counter;
	struct Fish {
		uint8 fishTypeIndex;
		string name; // Defaults to empty string, can be updated by owner later
		uint birth;
		uint8 strength;
		uint8 intelligence;
		uint8 agility;
		bytes32 traitsA;
		bytes32 traitsB;
		bytes32 traitsC;
		uint wins;
		uint challenger;
		uint challenged;
	}

	// Private members
	mapping(uint256 => Fish) private _fishData;
	Counters.Counter private _randCounter;
	uint8 private _fishTypeIndex = 0;
	address public _fightContractAddress;

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

	function createFish() private returns(uint){
		uint mintIndex = totalSupply();
		uint256 timeOfMint = block.timestamp;
		bytes32 traits1 = perCallRandomGeneration();
		bytes32 traits2 = perCallRandomGeneration();
		bytes32 traits3 = perCallRandomGeneration();
		uint8 strength = uint8(uint(traits1) % 256);
		uint8 intelligence = uint8(uint(traits2) % 256);
		uint8 agility = uint8(uint(traits3) % 256);
		_safeMint(msg.sender, mintIndex);
		_fishData[mintIndex] = Fish(_fishTypeIndex, "", timeOfMint, strength, intelligence, agility, traits1, traits2, traits3, 0, 0, 0);
		return mintIndex;
	}

	function catchFish() public payable returns(uint){
		uint randomNum = uint256(perCallRandomGeneration()) % 1000; // random number 1-1000
		// mint chance based on amount spent to mint
		if(msg.value >= 100 * 10**18) { // 100 ONE, guaranteed mint
			return createFish();
		} else if(msg.value >= 50 * 10**18 && randomNum < 250 ) { // 50 ONE, ~25% chance to mint
			return createFish();
		} else if(msg.value >= 25 * 10**18 && randomNum < 63) { // 25 ONE, ~6.25% chance to mint
			return createFish();
		} else if(msg.value >= 5 * 10**18 && randomNum < 13) { // 5 ONE, ~1.25% chance to mint
			return createFish();
		} else {
			return 0;
		}
	}

	// TODO Add onlyOwner functions to update baseURI
	// TODO Add onlyOwner functions to withdraw from contract with splitable


	function getFishInfo(uint256 tokenId) public view returns(Fish memory info) {
		require(_exists(tokenId), "That fish has not been minted yet.");
		return _fishData[tokenId];
	}

	function updateFishFightInfo(uint256 tokenId, bool isChallenger, bool isWinner) public {
		require(msg.sender == _fightContractAddress, "Only the FightContract can update a Fish's wins");
		require(_exists(tokenId), "That fish has not been minted yet.");
		// handle challenger/challenged counts
		if(isChallenger) {
			_fishData[tokenId].challenger += 1;
		} else {
			_fishData[tokenId].challenged += 1;
		}
		
		if(isWinner) {
			_fishData[tokenId].wins += 1;
		}
	}

	function updateFishFightContractAddress(address newAddress) public onlyOwner {
		_fightContractAddress = newAddress;
	}

	function perCallRandomGeneration() private returns(bytes32) {
		// _randCounter.increment();
		// return vrf() & keccak256(abi.encodePacked(_randCounter.current()));

		_randCounter.increment();
		return keccak256(abi.encodePacked(_randCounter.current()));
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