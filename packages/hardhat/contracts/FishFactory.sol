//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract FishFactory is ERC721Enumerable, ERC721URIStorage, Ownable {
	using Counters for Counters.Counter;
	using Strings for uint256;
	struct Fish {
		uint8 fishTypeIndex;
		string name; // Defaults to empty string, can be updated by owner later
		uint birth;
		bytes1 strength;
		bytes1 intelligence;
		bytes1 agility;
		bytes32 traitsA;
		bytes32 traitsB;
		bytes32 traitsC;
		uint wins;
		uint challenger;
		uint challenged;
	}

	event FishMinted(uint tokenId);

	// Private members
	mapping(uint256 => Fish) private _fishData;
	Counters.Counter private _randCounter;
	uint8 private _fishTypeIndex = 0;
	address public _fightContractAddress;
	address public _serverAddress = 0x61544AB146A815e6088d49c40d285C2a1F2fe84F;
	address public constant _teamAddress0 = 0xCc54A768677A6B8689eB92907F964d11a1F1B77E;
	address public constant _teamAddress1 = 0x33C533D80F0490E24C01AFEf25C0a057c74AfD87;

	// Public members
	string public _baseTokenURI = 'https://gateway.pinata.cloud/ipfs/';

	constructor() ERC721("Fish", "FSH") {}

	

	function getContractBalance() public view returns(uint256 _balance){
		uint256 contractBalance = address(this).balance;
		return contractBalance;
	}

	function createFish() private returns(uint){
		uint256 timeOfMint = block.timestamp;
		bytes32 traits1 = perCallRandomGeneration();
		bytes32 traits2 = perCallRandomGeneration();
		bytes32 traits3 = perCallRandomGeneration();
		bytes1 strength = traits1[0];
		bytes1 intelligence = traits2[0];
		bytes1 agility = traits3[0];
		uint mintIndex = totalSupply();
		_safeMint(msg.sender, mintIndex);
		_fishData[mintIndex] = Fish(_fishTypeIndex, "", timeOfMint, strength, intelligence, agility, traits1, traits2, traits3, 0, 0, 0);
		emit FishMinted(mintIndex);
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

	function updateServerAddress(address newAddress) public onlyOwner {
		_serverAddress = newAddress;
	}

	function perCallRandomGeneration() private returns(bytes32) {
		_randCounter.increment();
		return vrf() & keccak256(abi.encodePacked(_randCounter.current()));

		// _randCounter.increment();
		// return keccak256(abi.encodePacked(_randCounter.current()));
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

	// Owner functions
	function setBaseURI(string memory baseURI) public onlyOwner {
		_baseTokenURI = baseURI;
	}

	function withdraw() external onlyOwner {
    uint balance = address(this).balance;
    payable(_teamAddress0).transfer(balance * 50 / 100);
    payable(owner()).transfer(address(this).balance);
  }

	function setTokenURI(uint256 tokenId, string memory newTokenURI) external {
		require(msg.sender == _serverAddress, "Only the FightContract can update a Fish's wins");
		_setTokenURI(tokenId, newTokenURI);
	}

	function _baseURI() internal view override returns (string memory) {
		return _baseTokenURI;
	}
  

	// The following functions are overrides required by Solidity.
	function _beforeTokenTransfer(address from, address to, uint256 tokenId)
		internal
		override(ERC721, ERC721Enumerable)
	{
		super._beforeTokenTransfer(from, to, tokenId);
	}

	function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
		super._burn(tokenId);
	}

	function tokenURI(uint256 tokenId)
		public
		view
		override(ERC721, ERC721URIStorage)
		returns (string memory)
	{
		string memory tokenUri = super.tokenURI(tokenId);
		if(bytes(tokenUri).length == bytes(string(abi.encodePacked(_baseURI(), tokenId.toString()))).length) {
			return "";
		}
		return tokenUri;
	}

	function supportsInterface(bytes4 interfaceId)
		public
		view
		override(ERC721, ERC721Enumerable)
		returns (bool)
	{
		return super.supportsInterface(interfaceId);
	}
}