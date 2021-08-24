import { expect } from 'chai';
import { ethers } from 'hardhat';
import { FishFactory } from '../types/FishFactory';

describe('FishFactory', function () {
	it("Initial Contract Balance is Zero", async function () {
		const FishFactory = await ethers.getContractFactory('FishFactory');
		const fishFactory = (await FishFactory.deploy("www.test.com")) as FishFactory;
		await fishFactory.deployed();

		const contractBalance = await fishFactory.getContractBalance();
		expect(ethers.utils.formatEther(contractBalance)).to.equal('0.0');
	});

	it("Successfully Mints A Fish and Receives Value", async function () {
		const FishFactory = await ethers.getContractFactory('FishFactory');
		const fishFactory = (await FishFactory.deploy("www.test.com")) as FishFactory;
		await fishFactory.deployed();

		const contractBalance = await fishFactory.getContractBalance();
		expect(ethers.utils.formatEther(contractBalance)).to.equal('0.0');
		const diceRoll = await fishFactory.getContractBalance();
		console.log(diceRoll)
		const oneToSend = ethers.utils.parseEther('100');
		const catchFishTx = await fishFactory.catchFish("Fish1", {
			value: oneToSend,
		});

		// wait until the transaction is mined
		await catchFishTx.wait();
		const finalBalance = await fishFactory.getContractBalance();
		expect(ethers.utils.formatEther(finalBalance)).to.equal('100.0');

	});
});
