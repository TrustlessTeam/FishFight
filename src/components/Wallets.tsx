// @ts-nocheck
// React
import React from 'react';

// Styled Components
import styled from 'styled-components';

// Web3 React
import { useWeb3React } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';

// Utils
import { connectorsByName } from '../utils/connectors';
import { isInjectedWalletAvailable } from '../utils/walletConnector';

// Helpers
import { mapWallets } from '../helpers/walletHelpers';
import BaseButton from './BaseButton';
import { ContainerColumn, Title } from './BaseStyles';
import { useFishFight } from '../context/fishFightContext';

export interface Props {
	closeModal: () => void;
}

const Wallets = ({ closeModal }: Props) => {
	const { activate } = useWeb3React();
	const {setLogOut} = useFishFight();

	const handleClick = (connector: AbstractConnector) => async () => {
		// Activate will take connector as an argument
		// And then initialize web3React context with a provider.
		// Provider depends on the connector (i.e wallet) that has been chosen
		setLogOut(false);
		
		// Check if wallet is available
		if (!isInjectedWalletAvailable()) {
			alert('Please install MetaMask or another Web3 wallet to continue.');
			return;
		}

		try {
			// Modern MetaMask supports multichain - just connect, no network switching needed
			await activate(connector, undefined, true);
		closeModal();
		} catch (error: any) {
			console.error('Failed to activate wallet:', error);
			
			// Handle user rejection
			if (error?.message?.includes('rejected') || error?.code === 4001) {
				alert('Connection rejected. Please approve the connection in your wallet.');
			} else {
				alert(`Failed to connect wallet: ${error?.message || 'Unknown error'}`);
			}
		}
	}; 

	return (
		<WalletsComponent>
			<Title>
				Wallet Connect
			</Title>
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
