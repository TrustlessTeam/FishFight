// Harmony Wallets
//import { OneWalletConnector } from '@harmony-react/onewallet-connector';
//import { MathWalletConnector } from '@harmony-react/mathwallet-connector';

// Web3 React Wallets
import { AbstractConnector } from '@web3-react/abstract-connector';

// Standard wallet connector - simple and reliable
import { injected } from './walletConnector';

export enum ConnectorNames {
	OneWallet = 'OneWallet',
	CoinbaseWallet = 'CoinbaseWallet',
	MetaMaskWallet = 'MetaMaskWallet',
}

//const onewallet = new OneWalletConnector({ chainId: 2 }); // Mainnet -> chainId: 1 // Testnet & Localnet -> chainId 2
//const mathwallet = new MathWalletConnector({ chainId: 2 }); // Mainnet -> chainId: 1 // Testnet & Localnet -> chainId 2

// Export the standard injected connector
export { injected };

export const connectorsByName: { [connectorName: string]: AbstractConnector } = {
	// [ConnectorNames.OneWallet]: onewallet,
	[ConnectorNames.MetaMaskWallet]: injected,
	[ConnectorNames.CoinbaseWallet]: injected,
};
