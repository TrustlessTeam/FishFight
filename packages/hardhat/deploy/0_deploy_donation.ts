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

	const fishFactory = await ethers.getContract("FishFactory", deployer)
	fishFactory.updateFishFightContractAddress(Fight.address);
};

export default deploy;

export const tags = ['FishFactory'];
