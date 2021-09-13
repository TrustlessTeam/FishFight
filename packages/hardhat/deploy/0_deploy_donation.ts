import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const deploy: DeployFunction = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();
	console.log(deployer);

	const Factory = await deploy('FishFactory', {
		from: deployer,
		log: true,
		args: ["https://fishfight.one/"]
	});

	const Fight = await deploy('FishFight', {
		from: deployer,
		log: true,
		args: [Factory.address]
	});

	console.log(Fight.address)

	const fishFight = await ethers.getContract("FishFight", deployer)


	const fishFactory = await ethers.getContract("FishFactory", deployer)
	await fishFactory.updateFishFightContractAddress(Fight.address)

	const addressInFactory = await fishFactory._fightContractAddress();
	console.log(addressInFactory)

	// Testing of contract interactions

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
	console.log(catchFishTx2)

	// Get owners first fish
	const fish0 = await fishFactory.getFishInfo(0)
	const fish1 = await fishFactory.getFishInfo(1)
	console.log(fish0)
	console.log(fish1)
	
	const fight = await fishFight.fight(0, 1, 0);
	await fight.wait()
	console.log(fight)
	console.log(await fishFight.getFightsForFish(0))
	console.log(await fishFight.getFightsForFish(1))

	const fightInfo = await fishFight.getFightInfo(0)

	console.log(fightInfo)
	console.log(await fishFactory.getFishInfo(0))
	console.log(await fishFactory.getFishInfo(1))
};

export default deploy;

export const tags = ['FishFactory'];
