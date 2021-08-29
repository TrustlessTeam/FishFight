// Harmony SDK
import { Harmony, HarmonyExtension } from '@harmony-js/core';
import { Contract as HarmonyContract } from '@harmony-js/contract';

// Web3 React
import { HarmonyAbstractConnector } from '@harmony-react/abstract-connector';
import { AbstractConnector } from '@web3-react/abstract-connector';

// Helpers
import { getExtension } from './harmonyHelpers';

// Web3
import Web3 from 'web3';

// Contracts
import Contracts from '../contracts/contracts.json';

// Load Fish Factory contract data for front end
export const createFishFactoryContract = (hmy: Harmony | HarmonyExtension): HarmonyContract => {
	return hmy.contracts.createContract(Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address);
};

export const getFishFactoryContractFromConnector = async (
	connector: AbstractConnector,
	web3Provider: any,
): Promise<any> => {
	const harmonyConnector = connector as HarmonyAbstractConnector;
	if (harmonyConnector.windowKey) {
		const extensionWallet: any = window[harmonyConnector.windowKey];
		const hmyExtension = getExtension(extensionWallet);
		return new Promise(resolve => resolve(createFishFactoryContract(hmyExtension)));
	}
	// Connector is injected connector
	await web3Provider.provider.request({ method: 'eth_requestAccounts' });
	const web3 = new Web3(web3Provider.provider);
	const web3Contract = new web3.eth.Contract(
		Contracts.contracts.FishFactory.abi as any,
		Contracts.contracts.FishFactory.address,
	);
	return web3Contract;
};