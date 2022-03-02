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
import fishImgDark from "../img/icons/fish-dark.svg"
import deadImgDark from "../img/icons/dead-dark.svg"
import foodImgDark from "../img/icons/food-dark.svg"
import breedingImgDark from "../img/icons/breeding-dark.svg"
import fightingImgDark from "../img/icons/fighting-dark.svg"
import walletImg from "../img/icons/wallet.svg"
import breedingImg from "../img/icons/breeding.svg"
import fightingImg from "../img/icons/fighting.svg"
import { BaseButton } from './BaseStyles';


// ?
if (process.env.NODE_ENV !== 'test') Modal.setAppElement('#root');

type Props = {
  children?: React.ReactNode;
	mobile: boolean;
	textOverride?: string;
};

const Account = ({ children, mobile, textOverride }: Props) => {
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

	if(mobile) {
		return (
			<MobileContainer>
				<WalletImg open={modalIsOpen} onClick={openModal} src={walletImg} alt="User Wallet"></WalletImg>
				{children}
				<Modal
					// style={{overlay: { zIndex: 10}}}
					isOpen={modalIsOpen}
					className="Modal"
					overlayClassName="Overlay"
					onRequestClose={closeModal}
					shouldCloseOnOverlayClick
				>
					<ModalContainer>
						{active ? <SignOut account={parsedAccount} closeModal={closeModal} /> : <Wallets closeModal={closeModal} />}

						<Group>
							{account &&
							<>
								<BalanceComponent>
									<BalanceText>{balance?.split('.')[0]} ONE</BalanceText>
								</BalanceComponent>
								<BalanceComponent title="FISHFOOD Balance">
									<BalanceText>
										{parseFloat(balanceFood ? balanceFood : '0').toFixed(2)}<LogoImg src={foodImgDark} alt="FISHFOOD"></LogoImg>
									</BalanceText>
								</BalanceComponent>
								<BalanceComponent title="FISH Balance">
									<BalanceText>
										{balanceFish}<LogoImg src={fishImgDark} alt="FISH" ></LogoImg>
									</BalanceText>
								</BalanceComponent>

								<BalanceComponent title="FIGHTFISH Balance">
									<BalanceText>
										{balanceFightFish}<LogoImg src={fightingImgDark} alt="FIGHTFISH"></LogoImg>
									</BalanceText>
								</BalanceComponent>
								<BalanceComponent title="BREEDFISH Balance">
									<BalanceText>
										{balanceBreedFish}<LogoImg src={breedingImgDark} alt="BREEDFISH"></LogoImg>
									</BalanceText>
								</BalanceComponent>
								<BalanceComponent title="DEADFISH Balance">
									<BalanceText>
										{balanceDeadFish}<LogoImg src={deadImgDark} alt="DEADFISH"></LogoImg>
									</BalanceText>
								</BalanceComponent>
									
									
							</>
							}
						</Group>
					</ModalContainer>
				</Modal>
			</MobileContainer>
		);
	}

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
					<Row>{textOverride ? textOverride : "Connect"}<LogoImgWallet src={walletImg} alt="User Wallet"></LogoImgWallet></Row>
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
					<BalanceComponent title="FIGHTFISH Balance">
						<BalanceText>
							{balanceFightFish}<LogoImg src={fightingImg} alt="FIGHTFISH"></LogoImg>
						</BalanceText>
					</BalanceComponent>
					<BalanceComponent title="BREEDFISH Balance">
						<BalanceText>
							{balanceBreedFish}<LogoImg src={breedingImg} alt="BREEDFISH"></LogoImg>
						</BalanceText>
					</BalanceComponent>
					<BalanceComponent title="DEADFISH Balance">
						<BalanceText>
							{balanceDeadFish}<LogoImg src={deadImg} alt="DEADFISH"></LogoImg>
						</BalanceText>
					</BalanceComponent>
				</Group>
			</>
		}
	
			{children}
			<Modal
				style={{overlay: { zIndex: 10}}}
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

const MobileContainer = styled.div`
	display: flex;
	flex-flow: row nowrap;
	@media ${props => props.theme.device.tablet} {
		display: none;
  }
`;

const Container = styled.div`
	display: none;
	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row wrap;
		justify-content: flex-end;
		width: 100%;
  }
`;

const ModalContainer = styled.div`
	display: flex;
	flex-flow: column;
	/* @media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row wrap;
		justify-content: flex-end;
  } */
`;

const Group = styled.div`
	display: flex;
	flex-flow: row wrap;
	padding: ${props => props.theme.spacing.gap};

	@media ${props => props.theme.device.tablet} {
		flex-flow: row nowrap;
		justify-content: flex-end;
		width: 100%;
		padding: 0;

  }
`;

const AccountComponent = styled(BaseButton)`
	border-radius: 25px;

/* 
	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	} */
	z-index: 5;
	/* @media ${props => props.theme.device.tablet} {
	  font-size: ${props => props.theme.font.medium};
  } */
	&::before {
    border-radius: 25px;
  }
`;

const Span = styled.span`
	display: flex;
	flex-flow: column;
	justify-content: center;
	align-items: center;
`;

const Row = styled.span`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
`;

const BalanceText = styled.b`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
	font-size: ${props => props.theme.font.medium};
	/* margin-right: ${props => props.theme.spacing.gapSmall}; */
	cursor: default;
	color: black;
	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
		color: white;
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

const LogoImgWallet = styled.img`
	height: 25px;
	margin-left: 2px;
`;

const WalletImg = styled.img<{open: boolean}>`
	background-color: ${p => (p.open ? "gray" : "white")};
	padding: ${props => props.theme.spacing.gapSmall};
	height: 25px;
	margin-left: ${props => props.theme.spacing.gapSmall};
	border-radius: 50%;

	@media ${props => props.theme.device.tablet} {
	  height: 20px;
  }
`;

export default Account;
