// Ethers
import { Web3Provider } from '@ethersproject/providers';

// Harmony SDK
import { ChainID, ChainType } from '@harmony-js/utils';
import { Harmony } from '@harmony-js/core';

// Types
type Library = Web3Provider | Harmony;

type Provider = {
	chainId: ChainID, // ChainID
	chainType: ChainType, // ChainType e.g Harmony or Ethereum
	url: string, // web3 provider url
	networkId: string // Why do we need this?
}

// Depending on this the provider will be chosen
const envProvider: string = process.env.REACT_APP_FRONTEND_NETWORK || 'localnet';


// Provider list
const configProviders: { [name: string]: Provider } = {
	localnet: {
		chainId: ChainID.HmyLocal,
		chainType: ChainType.Harmony,
		url: 'http://localhost:9500',
		networkId: '1666700000',
	},
	testnet: {
		chainId: ChainID.HmyTestnet,
		chainType: ChainType.Harmony,
		url: 'https://api.s0.b.hmny.io',
		networkId: '1666700000',
	},
	mainnet: {
		chainId: ChainID.HmyMainnet,
		chainType: ChainType.Harmony,
		url: 'https://api.s0.t.hmny.io',
		networkId: '1666600000',
	},
};

// From provider list get the one we need
export const getProvider = (): Provider => configProviders[envProvider];

export const getLibraryProvider = (provider: any): Library => {
	let library: Web3Provider | Harmony;

	if (provider?.chainType === 'hmy') {
		provider.setProvider(getProvider().url);
		library = provider.blockchain;
	} else {
		library = new Web3Provider(provider);
		library.pollingInterval = 12000;
	}

	return library;
};
