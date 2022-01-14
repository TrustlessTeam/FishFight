// React
import React, { useState } from 'react';
import Modal from 'react-modal';

// Styled Components
import styled from 'styled-components';

// Web3 React
import { useWeb3React } from '@web3-react/core';

// Harmony SDK
import { toBech32 } from '@harmony-js/crypto';
import { isBech32Address } from '@harmony-js/utils';

// Components
import SignOut from './SignOut';
import Wallets from './Wallets';

import { useFishFight } from '../context/fishFightContext';
import fishImg from "../img/icons/fish.svg"
import deadImg from "../img/icons/dead.svg"
import foodImg from "../img/icons/food.svg"


// ?
if (process.env.NODE_ENV !== 'test') Modal.setAppElement('#root');

type Props = {
  children?: React.ReactNode;
};

const Account = ({ children }: Props) => {
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const { account, active } = useWeb3React();
	const { balance, balanceFish, balanceDeadFish, balanceFood, balanceFightFish, balanceBreedFish  } = useFishFight();


	const parsedAccount = account && !isBech32Address(account) ? toBech32(account) : account;

	const openModal = () => {
		setModalIsOpen(true);
	};

	const closeModal = () => {
		setModalIsOpen(false);
	};

	return (
		<Container>
		<Group>
			{account &&
			<>
				<BalanceComponent>
					<BalanceText>{balance?.split('.')[0]} ONE</BalanceText>
				</BalanceComponent>
				<BalanceComponent title="FISHFOOD Balance">
					<BalanceText>
						{parseFloat(balanceFood ? balanceFood : '0').toFixed(2)}<LogoImg src={foodImg} alt="FISHFOOD"></LogoImg>
					</BalanceText>
				</BalanceComponent>
			</>
			}
			
			<AccountComponent onClick={openModal}>
				{parsedAccount ? (
					<span>
						{parsedAccount.substring(0, 6)}...{parsedAccount.substring(parsedAccount.length - 4)}
					</span>
				) : (
					<Span>Connect Wallet</Span>
				)}
			</AccountComponent>
		</Group>
		{account &&
			<>
				<Group>
					<BalanceComponent title="FISH Balance">
						<BalanceText>
							{balanceFish}<LogoImg src={fishImg} alt="FISH" ></LogoImg>
						</BalanceText>
					</BalanceComponent>
					<BalanceComponent title="DEADFISH Balance">
						<BalanceText>
							{balanceDeadFish}<LogoImg src={deadImg} alt="DEADFISH"></LogoImg>
						</BalanceText>
					</BalanceComponent>
					
					<BalanceComponent title="FIGHTFISH Balance">
						<BalanceText>
							{balanceFightFish}<LogoImg src={fishImg} alt="FIGHTFISH"></LogoImg>F
						</BalanceText>
					</BalanceComponent>
					<BalanceComponent title="BREEDFISH Balance">
						<BalanceText>
							{balanceBreedFish}<LogoImg src={fishImg} alt="BREEDFISH"></LogoImg>B
						</BalanceText>
					</BalanceComponent>
				</Group>
			</>
		}
	
			{children}
			<Modal
				isOpen={modalIsOpen}
				className="Modal"
				overlayClassName="Overlay"
				onRequestClose={closeModal}
				shouldCloseOnOverlayClick
			>
				{active ? <SignOut account={parsedAccount} closeModal={closeModal} /> : <Wallets closeModal={closeModal} />}
			</Modal>
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	flex-flow: row nowrap;
	@media ${props => props.theme.device.tablet} {
		flex-flow: row wrap;
		justify-content: flex-end;
  }
`;

const Group = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: flex-end;
	width: 100%;
`;

const AccountComponent = styled.div`
	display: flex;
	justify-content: center;
	font-size: ${props => props.theme.font.medium}vmax;
	padding: ${props => props.theme.spacing.gapSmall} ${props => props.theme.spacing.gapSmall};
	border-radius: 25px;
	background-color: white;
	opacity: 0.7;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.25);
	color: black;
	margin-left: ${props => props.theme.spacing.gapSmall};
	transition: opacity 0.3s ease, box-shadow 0.25s ease-in-out;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
	z-index: 5;
	@media ${props => props.theme.device.tablet} {
	  font-size: ${props => props.theme.font.medium}vmin;
  }
`;

const Span = styled.span`
	display: flex;
	flex-flow: column;
	justify-content: center;
	align-items: center;
`;

const BalanceText = styled.b`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
	font-size: ${props => props.theme.font.medium}vmax;
	/* margin-right: ${props => props.theme.spacing.gapSmall}; */
	cursor: default;
	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium}vmin;
  }
`;

const BalanceComponent = styled.div`
	display: flex;
	flex-flow: row;
	justify-content: center;
	margin-left: ${props => props.theme.spacing.gap};
	/* padding: ${props => props.theme.spacing.gap} ${props => props.theme.spacing.gap}; */
	/* background-color: white; */
	color: white;
	/* border: 2px solid white; */
	border-radius: 50%;

	& > span {
		margin-left: 4px;
	}
`;

const LogoImg = styled.img`
	height: 25px;
	margin-left: ${props => props.theme.spacing.gapSmall};

	@media ${props => props.theme.device.tablet} {
	  height: 30px;
  }
`;

export default Account;
