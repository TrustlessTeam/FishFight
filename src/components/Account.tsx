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
import BaseButton from "../components/BaseButton";

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
import { BaseContainerCentered, BaseText, ContainerColumn, ContainerRow, StyledModal, Title } from './BaseStyles';
import { useContractWrapper } from '../context/contractWrapperContext';
import { Constants } from '../utils/constants';
import Balance from './Balance';


// ?
if (process.env.NODE_ENV !== 'test') Modal.setAppElement('#root');

type Props = {
  children?: React.ReactNode;
	textOverride?: string;
};

const Account = ({ children, textOverride }: Props) => {
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const { account, active } = useWeb3React();
	const { balance, balanceFish, balanceDeadFish, balanceFood, balanceFightFish, balanceBreedFish, FishFight  } = useFishFight();

const { contractApproveFishForBreeding, perTransactionApproval, setPerTransactionApproval, contractApproveFoodForTraining, contractApproveFishForFighting,  } = useContractWrapper();

	const parsedAccount = account && !isBech32Address(account) ? toBech32(account) : account;

	const openModal = () => {
		setModalIsOpen(true);
	};

	const closeModal = () => {
		setModalIsOpen(false);
	};

	const handleChange = () => {
		setPerTransactionApproval(!perTransactionApproval)
  };

	const IndividualApprovals = () => {
		return(
			<CheckboxContainer>
				<input
					type="checkbox"
					checked={perTransactionApproval}
					onChange={handleChange}
				/>
				<Text><span>(NOT RECOMMENDED)</span> Set approvals per action when playing FishFight.</Text>
			</CheckboxContainer>
		)
	}

	const addFishFoodToMetaMask = async () => {
		const tokenAddress = FishFight.readFishFood.options.address;
		const tokenSymbol = 'FISHFOOD';
		const tokenDecimals = 18;
		// const tokenImage = 'http://placekitten.com/200/300';

		try {
			// wasAdded is a boolean. Like any RPC method, an error may be thrown.
			const wasAdded = await window.ethereum.request({
				method: 'wallet_watchAsset',
				params: {
					type: 'ERC20', // Initially only supports ERC20, but eventually more!
					options: {
						address: tokenAddress, // The address that the token is at.
						symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
						decimals: tokenDecimals, // The number of decimals in the token
						// image: tokenImage, // A string url of the token logo
					},
				},
			});

			if (wasAdded) {
				console.log('Thanks for your interest!');
			} else {
				console.log('Your loss!');
			}
		} catch (error) {
			console.log(error);
		}
	}

	const addFishToMetaMask = async () => {
		const tokenAddress = FishFight.readFishFactory.options.address;
		const tokenSymbol = 'FISH';
		const tokenDecimals = 0;
		// const tokenImage = 'http://placekitten.com/200/300';

		try {
			// wasAdded is a boolean. Like any RPC method, an error may be thrown.
			const wasAdded = await window.ethereum.request({
				method: 'wallet_watchAsset',
				params: {
					type: 'ERC20', // Initially only supports ERC20, but eventually more!
					options: {
						address: tokenAddress, // The address that the token is at.
						symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
						decimals: tokenDecimals, // The number of decimals in the token
						// image: tokenImage, // A string url of the token logo
					},
				},
			});

			if (wasAdded) {
				console.log('Thanks for your interest!');
			} else {
				console.log('Your loss!');
			}
		} catch (error) {
			console.log(error);
		}
	}

	const AccountData = () => {
		return(
			<>
				{active ? 
					<Wrapper>
						<ContainerColumnLeft>
							<Title>Connected Wallet</Title>
							<Row>
								<AccountText>
									{parsedAccount?.substring(0, 6)}...{parsedAccount?.substring(parsedAccount?.length - 4)}
								</AccountText>
								<SignOut account={parsedAccount} closeModal={closeModal} />
							</Row>

							<BalanceModal>
								<BalanceText>{balance?.split('.')[0]} ONE</BalanceText>
								<Balance></Balance>
							</BalanceModal>
						</ContainerColumnLeft>
						
							

						
						<ContainerColumnLeft>
							<Title>Offical Contracts and Approvals</Title>
							<Row>
								<Text>$FISH ERC721 Contract <a target="_blank" rel="noopener noreferrer" href={`${Constants._explorer}address/${FishFight.readFishFactory.options.address}`}>{FishFight.readFishFactory.options.address}</a></Text>
								<BaseButton onClick={addFishToMetaMask}>Add $FISH to MetaMask</BaseButton>		
							</Row>
							<Row>
								<Text>$FISHFOOD ERC20 Contract <a target="_blank" rel="noopener noreferrer" href={`${Constants._explorer}address/${FishFight.readFishFood.options.address}`}>{FishFight.readFishFood.options.address}</a></Text>
								<BaseButton onClick={addFishFoodToMetaMask}>Add $FISHFOOD to MetaMask</BaseButton>		
							</Row>
							<Row>
								<Text>Training Contract <a target="_blank" rel="noopener noreferrer" href={`${Constants._explorer}address/${FishFight.readTrainingWaters.options.address}`}>{FishFight.readTrainingWaters.options.address}</a></Text>
								<BaseButton onClick={() => contractApproveFoodForTraining('0', ()=>{})}>Revoke $FISHFOOD Allowance</BaseButton>		
							</Row>
							<Row>
								<Text>Fighting Contract <a target="_blank" rel="noopener noreferrer" href={`${Constants._explorer}address/${FishFight.readFightingWaters.options.address}`}>{FishFight.readFightingWaters.options.address}</a></Text>
								<BaseButton onClick={() => contractApproveFishForFighting(-1, ()=>{})}>Revoke $FISH Control</BaseButton>
							</Row>
							<Row>
								<Text>Breeding Contract <a target="_blank" rel="noopener noreferrer" href={`${Constants._explorer}address/${FishFight.readBreedingWaters.options.address}`}>{FishFight.readBreedingWaters.options.address}</a></Text>
								<BaseButton onClick={() => contractApproveFishForBreeding(-1, ()=>{})}>Revoke $FISH Control</BaseButton>
							</Row>
						</ContainerColumnLeft>
						<IndividualApprovals></IndividualApprovals>
					</Wrapper>
					
					:

					<Wallets closeModal={closeModal} />
				}
			</>
		)
	}

	return (
		<>
		<DesktopContainer onClick={openModal}>
			{parsedAccount ? (
				<ConnectedAccount onClick={openModal}>
					<BalanceText>{balance?.split('.')[0]} ONE</BalanceText>
					<AccountText>
						{parsedAccount.substring(0, 6)}...{parsedAccount.substring(parsedAccount.length - 4)}
					</AccountText>
				</ConnectedAccount>
				
			) : (
				<AccountComponent onClick={openModal}>{textOverride ? textOverride : "Connect"}<LogoImgWallet src={walletImg} alt="User Wallet"></LogoImgWallet></AccountComponent>
			)}
			{account &&
				<Balance></Balance>
			}
		</DesktopContainer>

		<MobileContainer>
			<WalletMobileButton onClick={openModal}>
				<LogoImg src={walletImg} alt="User Wallet"></LogoImg>
			</WalletMobileButton>

		</MobileContainer>
		
	


			<RightModal
				// style={{overlay: { zIndex: 10}}}
				isOpen={modalIsOpen}
				className="Modal"
				overlayClassName="Overlay"
				onRequestClose={closeModal}
				shouldCloseOnOverlayClick
			>
				<AccountData></AccountData>
			</RightModal>
		</>
	);
};

const DesktopContainer = styled.div`
	display: none;
	position: relative;
	pointer-events: auto;
	cursor: pointer;
	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row wrap;
		justify-content: flex-end;
		width: 100%;
		z-index: 5;
		transition: all 0.2s ease-in-out;

  }
`;

const MobileContainer = styled.div`
	display: flex;
	flex-flow: row nowrap;
	@media ${props => props.theme.device.tablet} {
		display: none;
  }
`;

const CheckboxContainer = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: flex-start;
	padding: ${props => props.theme.spacing.gap} ${props => props.theme.spacing.gap} 0;
	width: 100%;

	p {
		font-size: ${props => props.theme.font.small};
	}
`

const RightModal = styled(StyledModal)`
	top: 60px;
  transform: translate(-50%, 0%);
	width: 100%;
	
	@media ${props => props.theme.device.tablet} {
		width: 50%;
		top: 115px;
		right: 0;
		transform: translate(0%, 0%);
	}
`;

const Wrapper = styled(ContainerColumn)`
	justify-content: flex-start;
  align-items: flex-start;
`;

const Text = styled.p`
	color: white;
	margin: 0;
	font-weight: bold;
	font-size: ${props => props.theme.font.small};

	span {
		color: black;
	}

	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
	}
`;

const Row = styled.div`
	position: relative;
	display: flex;
	flex-flow: row wrap;
	justify-content: flex-start;
	align-items: center;
	width: 100%;
	padding: ${props => props.theme.spacing.gap} ${props => props.theme.spacing.gap} 0;
	z-index: 5;
`;

const BalanceModal = styled(Row)`
	@media ${props => props.theme.device.tablet} {
		display: none;
	}
`

const ContainerColumnLeft = styled(ContainerColumn)`
	justify-content: flex-start;
  align-items: flex-start;
	padding: 0 0 ${props => props.theme.spacing.gap};
`;

const ConnectedAccount = styled(BaseButton)`
	display: flex;
	flex-flow: row nowrap;
	justify-content: flex-end;
	align-items: center;
	border-radius: 25px;
	border: solid white 1px;
	background: none;
	box-shadow: none;
	padding: 0;
  transition: all 0.25s ease-in-out;
	cursor: pointer;

	/* padding: 3px 5px; */
	&::before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: none;
  }
`;

const AccountText = styled.b`
	font-size: ${props => props.theme.font.medium};
	background-color: white;
	border-radius: 25px;
	color: black;
	padding: 6px 10px;
	border: solid white 1px;
	/* margin-right: ${props => props.theme.spacing.gapSmall}; */
	
	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
  }
`;

const BalanceText = styled(AccountText)`
	display; flex;
	flex-flow: row nowrap;
	background: none;
	color: white;
	border: 0;
`;

const AccountComponent = styled(BaseButton)`
	border-radius: 25px;
	pointer-events: default;
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


const WalletMobileButton = styled(BaseButton)`
	padding: 5px;
	border-radius: 50%;

	&::before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 50%;
    background-image: linear-gradient(#ffffff, #e2e2e2);
    z-index: -1;
    transition: opacity 0.25s ease-in-out;
    opacity: 0;
  }

	@media ${props => props.theme.device.tablet} {
	  padding: 10px;
  }
`;


const LogoImg = styled.img`
	height: 25px;
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
