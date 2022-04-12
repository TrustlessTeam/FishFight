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


export interface Props {
	closeModal: () => void;
}

const Wallets = ({ closeModal }: Props) => {
	const { activate } = useWeb3React();
	const {setLogOut} = useFishFight();

	const handleClick = (connector: AbstractConnector) => () => {
		// Activate will take connector as an argument
		// And then initialize web3React context with a provider.
		// Provider depends on the connector (i.e wallet) that has been chosen
		setLogOut(false);
		activate(connector);
		closeModal();
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
