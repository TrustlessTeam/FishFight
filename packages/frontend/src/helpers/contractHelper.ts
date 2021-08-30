// Harmony SDK
import { Blockchain, Harmony, HarmonyExtension } from '@harmony-js/core';
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
import { Web3Provider } from '@ethersproject/providers';

// Load Fish Factory contract data for front end
export const createFishFactoryContract = (hmy: Harmony | HarmonyExtension): HarmonyContract => {
	const hmyContract = hmy.contracts.createContract(Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address);
	
	// const web3Contract = 
	return hmyContract
};

export const getFishFactoryContractFromConnector = async (connector: AbstractConnector | HarmonyAbstractConnector, web3Provider: Web3Provider | Blockchain | any): Promise<any> => {
	const harmonyConnector = connector as HarmonyAbstractConnector;

	// If connector is a HarmonyAbstractConnector (mathWallet or OneWallet), it will contain windowKey.
	if (harmonyConnector.windowKey) {
		// Get wallet provider
		const extensionWallet: any = window[harmonyConnector.windowKey];
		// Start a harmony instance that can handle user interactions.
		const hmyExtension = getExtension(extensionWallet);
		// With that harmony extension initiate the contract
		return new Promise(resolve => resolve(createFishFactoryContract(hmyExtension)));
	}


	// If connector is AbstractConnector (not a harmony wallet)
	// Get wallet provider from web3Provider
	await web3Provider.provider.request({ method: 'eth_requestAccounts' });
	// Initiate provider instance
	const web3 = new Web3(web3Provider.provider);
	// Start contract
	const web3Contract = new web3.eth.Contract(
		Contracts.contracts.FishFactory.abi as any,
		Contracts.contracts.FishFactory.address,
	);
	return web3Contract;
};