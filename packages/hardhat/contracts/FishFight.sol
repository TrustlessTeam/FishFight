//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./FishFactory.sol";

contract FishFight is Ownable {
	using Counters for Counters.Counter;
	struct Fight {
		uint8 typeOfFight;
		uint256 fishChallenger;
		uint256 fishChallenged;
		uint timeOfFight;
		bytes32 round1;
		bytes32 round2;
		bytes32 round3;
		int256 winner;
	}

	// Private members
	address private _fishFactoryAddress;
	mapping(uint256 => Fight) private _fights;
	Counters.Counter private _randCounter;
	Counters.Counter private _fightCounter;
	FishFactory private _factory;

	constructor(address fishFactoryAddress) {
		_fishFactoryAddress = fishFactoryAddress;
		_factory = FishFactory(_fishFactoryAddress);
	}

	function getContractBalance() public view returns(uint256 _balance){
		uint256 contractBalance = address(this).balance;
		return contractBalance;
	}

	function fight(uint fishChallengerTokenId, uint fishChallengedTokenId, uint8 fightType) public returns(uint fightIndex) {
		verifyChallengerOwnsFish(fishChallengerTokenId, fishChallengedTokenId);
		uint256 timeOfFight = block.timestamp;
		bytes32 round1 = perCallRandomGeneration();
		bytes32 round2 = perCallRandomGeneration();
		bytes32 round3 = perCallRandomGeneration();
		int winner = getOutcome(fishChallengerTokenId, fishChallengedTokenId, fightType, round1, round2, round3);
		uint fightIndex = _fightCounter.current();
		_fights[fightIndex] = Fight(fightType, fishChallengerTokenId, fishChallengedTokenId, timeOfFight, round1, round2, round3, winner);
		_fightCounter.increment();
		if(winner != -1) _factory.addWin(uint(winner)); // add win to the winning tokenId
		return fightIndex;
	}

	function verifyChallengerOwnsFish(uint fishChallengerTokenId, uint fishChallengedTokenId) private view {
		address tokenOwner = _factory.ownerOf(fishChallengerTokenId);
		require(tokenOwner == msg.sender, "Must be owner of Token to create a challenge.");
		require(fishChallengedTokenId != fishChallengedTokenId, "Tokens can't be the same");
	}

	function getOutcome(uint fishChallengerTokenId, uint fishChallengedTokenId, uint8 fightType, bytes32 round1, bytes32 round2, bytes32 round3) private view returns(int winner) {
		FishFactory.Fish memory challenger = _factory.getFishInfo(fishChallengerTokenId);
		FishFactory.Fish memory challenged = _factory.getFishInfo(fishChallengedTokenId);
		uint8 challengerWins = 0;
		uint8 challengedWins = 0;
		// Battle on 3 rounds of head to head comparison of fish traits (randomly picked)
		if(fightType == 0) {
			uint8[3] memory roundTraits = [uint8(uint(round1) % 3), uint8(uint(round2) % 3), uint8(uint(round3) % 3)];
			for(uint8 i = 0; i < roundTraits.length; i++) {
				// Strength fight
				if(roundTraits[i] == 0 && challenger.strength > challenged.strength) challengerWins++;
				if(roundTraits[i] == 0 && challenger.strength < challenged.strength) challengedWins++;

				// Intelligence fight
				if(roundTraits[i] == 1 && challenger.intelligence > challenged.intelligence) challengerWins++;
				if(roundTraits[i] == 1 && challenger.intelligence < challenged.intelligence) challengedWins++;
				
				// Agility fight
				if(roundTraits[i] == 2 && challenger.agility > challenged.agility) challengerWins++;
				if(roundTraits[i] == 2 && challenger.agility < challenged.agility) challengedWins++;
			}

			if(challengerWins > challengedWins) return int(fishChallengerTokenId); // challenger wins
			if(challengerWins < challengedWins) return int(fishChallengedTokenId); // challenged wins
			if(challengerWins == challengedWins) return -1; // tie
		}
	}

	function getFightInfo(uint256 tokenId) public view returns(Fight memory info) {
		require(tokenId < _fightCounter.current(), "That fight has not happened yet");
		return _fights[tokenId];
	}

	function perCallRandomGeneration() private returns(bytes32) {
		_randCounter.increment();
		return vrf() & keccak256(abi.encodePacked(_randCounter.current()));
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