import { expect } from 'chai';
import { ethers } from 'hardhat';
import { FishFactory } from '../types/FishFactory';
import { FishFight } from '../types/FishFight';

describe('FishFactory', function () {
	// it("Initial Contract Balance is Zero", async function () {
	// 	const FishFactory = await ethers.getContractFactory('FishFactory');
	// 	const fishFactory = (await FishFactory.deploy("www.test.com")) as FishFactory;
	// 	await fishFactory.deployed();

	// 	const contractBalance = await fishFactory.getContractBalance();
	// 	expect(ethers.utils.formatEther(contractBalance)).to.equal('0.0');
	// });

	// it("Successfully Mints A Fish and Receives Value", async function () {
	// 	const FishFactory = await ethers.getContractFactory('FishFactory');
	// 	const fishFactory = (await FishFactory.deploy("www.test.com")) as FishFactory;
	// 	await fishFactory.deployed();

	// 	const contractBalance = await fishFactory.getContractBalance();
	// 	expect(ethers.utils.formatEther(contractBalance)).to.equal('0.0');

	// 	const oneToSend = ethers.utils.parseEther('100');
	// 	const catchFishTx = await fishFactory.catchFish({
	// 		value: oneToSend,
	// 	});

	// 	// wait until the transaction is mined
	// 	await catchFishTx.wait();
	// 	const finalBalance = await fishFactory.getContractBalance();
	// 	expect(ethers.utils.formatEther(finalBalance)).to.equal('100.0');

	// });

	it("Catch Fish and Fight them", async function () {
		// Deploy Fish Factory
		const FishFactory = await ethers.getContractFactory('FishFactory');
		const fishFactory = (await FishFactory.deploy("https://fishfight.one/")) as FishFactory;
		await fishFactory.deployed();

		// Deploy Fish Fight
		const FishFight = await ethers.getContractFactory('FishFight');
		const fishFight = (await FishFight.deploy(fishFactory.address)) as FishFight;
		await fishFight.deployed();
		await fishFactory.updateFishFightContractAddress(fishFight.address)

		// Accounts
		const [owner, addr1, addr2] = await ethers.getSigners();

		console.log(addr1)
		
		// Mint fish for owner account
		const oneToSend = ethers.utils.parseEther('100');
		const catchFishTx = await fishFactory.catchFish({
			value: oneToSend,
		});
		await catchFishTx.wait();

		// Mint fish for another account
		const catchFishTx2 = await fishFactory.catchFish({
			value: oneToSend,
		});
		await catchFishTx2.wait();

		// Get owners first fish
		const fish0 = await fishFactory.getFishInfo(0)
		const fish1 = await fishFactory.getFishInfo(1)
		console.log(fish0)
		console.log(fish1)
		
		const fight = await fishFight.fight(0, 1, 0);
		await fight.wait()
		const fightInfo = await fishFight.getFightInfo(0)

		console.log(fightInfo)
		console.log(await fishFactory.getFishInfo(0))
		console.log(await fishFactory.getFishInfo(1))
	});

});
