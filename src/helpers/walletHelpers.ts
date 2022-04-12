import { ConnectorNames } from '../utils/connectors';

import CoinbaseImg from '../img/wallets/coinbase.png';
import OneWallet from '../img/wallets/one.svg';
import Metamask from '../img/wallets/metamask.svg';

interface WalletUI {
	name: string;
	image: string;
}

export const mapWallets: { [waletName: string]: WalletUI } = {
	// [ConnectorNames.OneWallet]: {
	// 	name: 'One wallet',
	// 	image: OneWallet,
	// },
	[ConnectorNames.MetaMaskWallet]: {
		name: 'MetaMask',
		image: Metamask,
	},
		[ConnectorNames.CoinbaseWallet]: {
			name: 'Coinbase Wallet',
			image: CoinbaseImg,
		},
};
