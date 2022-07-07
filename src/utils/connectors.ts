// Web3 React Wallets
import { InjectedConnector } from '@web3-react/injected-connector';

import { AbstractConnector } from '@web3-react/abstract-connector';

export enum ConnectorNames {
	CoinbaseWallet = 'CoinbaseWallet',
	MetaMaskWallet = 'MetaMaskWallet',
}

export const injected = new InjectedConnector({ supportedChainIds: [1666600000, 1666700000] });

export const connectorsByName: { [connectorName: string]: AbstractConnector } = {
	[ConnectorNames.MetaMaskWallet]: injected,
	[ConnectorNames.CoinbaseWallet]: injected,
};
