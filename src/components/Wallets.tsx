// React
import React from 'react';

// Styled Components
import styled from 'styled-components';

// Web3 React
import { useWeb3React } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';

// Utils
import { connectorsByName } from '../utils/connectors';

// Helpers
import { mapWallets } from '../helpers/walletHelpers';
import BaseButton from './BaseButton';
import { ContainerColumn, Title } from './BaseStyles';
import { useFishFight } from '../context/fishFightContext';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

export interface Props {
	closeModal: () => void;
}

const Wallets = ({ closeModal }: Props) => {
	const { activate } = useWeb3React();
	const {setLogOut} = useFishFight();

	const web3Modal = new Web3Modal({
		cacheProvider: true,
		providerOptions: {
		  walletconnect: {
			package: WalletConnectProvider,
			options: {
			  infuraId: "0ce3f5bf076b47278cf8eb038803c232",
			  rpc: {
				1666600000: "https://api.harmony.one",
			  },
			},
		  },
		},
	  });

	const handleClick = (connector: AbstractConnector) => () => {
		// Activate will take connector as an argument
		// And then initialize web3React context with a provider.
		// Provider depends on the connector (i.e wallet) that has been chosen
		setLogOut(false);
		activate(connector);
		closeModal();
	}; 

	const handleWC = () => async () =>  {
		closeModal();
		try {
			
			web3Modal.clearCachedProvider();
			var provider, accounts;
			console.log("triggered");
			provider = await web3Modal.connect();
			const wcWeb3 = new Web3(provider);
			console.log(`provider retrieval success`);
			accounts = await provider.request({ method: 'eth_accounts' });
			console.log(`accounts : ${accounts}`);
		} catch (error){
			console.log(error);
		}
	};

	return (
		<WalletsComponent>
			<WalletItem onClick={handleWC()}>
				Wallet Connect
			</WalletItem>
			{
			Object.keys(connectorsByName).map(name => (
				<WalletItem key={name} onClick={handleClick(connectorsByName[name])}>
					<WalletImg src={mapWallets[name].image} />
					{mapWallets[name].name}
				</WalletItem>
			))}
		</WalletsComponent>
	);
};

const WalletImg = styled.img`
	width: 42px;
	height: 42px;
	margin-bottom: 1rem;
`;

const WalletsComponent = styled(ContainerColumn)`
	/* display: grid;
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	overflow: hidden; */
	display: flex;
	flex-flow: row;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	z-index: 20;
`;

const WalletItem = styled(BaseButton)`
	margin-top: ${props => props.theme.spacing.gap};
`;

export default Wallets;
