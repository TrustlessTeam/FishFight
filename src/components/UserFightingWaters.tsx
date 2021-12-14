import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { Fish } from '../utils/fish'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import FishViewer from './FishViewer';
import Menu, { MenuItem } from './Menu';
import StakedStatus from './StakedStatus';
import { BaseContainer, BaseOverlayContainer, ContainerControls } from './BaseStyles';
import LoadingOverlay from 'react-loading-overlay';

import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from 'ethereum-multicall';
import web3 from 'web3';

enum FishSelectionEnum {
  UserFightingFish,
  UserFish
}

const UserFightingWaters = () => {
	const { FishFight, refetchBalance } = useFishFight()
	const { userFish, userFightingFish, fightingFish, depositUserFightingFish, withdrawUserFightingFish } = useFishPool()
	const [fishSelectionToShow, setFishSelectionToShow] = useState<number>(FishSelectionEnum.UserFightingFish);
	const [renderedFish, setRenderedFish] = useState<number[]>([]);
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);

	// Fish selected for fight
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);

	// Context
	const { account } = useWeb3React();
	const unityContext = useUnity();

	const FishViewOptions: MenuItem[] = [
		{
			name: 'My Fighting Fish',
			onClick: () => setFishSelectionToShow(FishSelectionEnum.UserFightingFish)
		},
		{
			name: 'My Fish',
			onClick: () => setFishSelectionToShow(FishSelectionEnum.UserFish)
		}
	]

	useEffect(() => {
		console.log("UserFightingFish")
		unityContext.showFight();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		console.log("Fightintg Fish Changed")
		console.log(fightingFish)
		console.log(userFightingFish)
		console.log(userFish)
		if(!unityContext.isFishPoolReady) return;
		let i = 0;
		fightingFish.forEach(fish => {
			if(!renderedFish.includes(fish.tokenId)) {
				unityContext.addFishOcean(fish);
				setRenderedFish(prevData => [...prevData, fish.tokenId])
				i++;
			}
		})
		console.log(i)
	}, [fightingFish, userFightingFish, userFish, unityContext.isFishPoolReady]);

	const setUserFish = (fish : Fish) => {
		console.log("User Fish: " + fish.tokenId)
		setMySelectedFish(fish);
		unityContext.addFishFight1(fish);
		// unityContext.showFish(fish);
	}

	const selectAnother = () => {
		setMySelectedFish(null);
		// unityContext.showFight(); // switch to FightingWaters view
	}

	const depositFish = async (fish : Fish) => {
		if (account && mySelectedFish != null) {
			try {
				if(FishFight.type === 'web3') {
					const web3WalletProvider = FishFight.providerWallet as web3;
					const approveAndDeposit = new web3WalletProvider.BatchRequest();
					approveAndDeposit.add(
						FishFight.fishFactory?.methods.approve(FishFight.readFightingWaters.options.address, fish.tokenId).send({
							from: account,
							gasPrice: 1000000000,
							gasLimit: 500000,
						})
					);
					approveAndDeposit.add(
						FishFight.fightingWaters?.methods.deposit(fish.tokenId).send({
							from: account,
							gasPrice: 1000000000,
							gasLimit: 800000,
						}).on('transactionHash', () => {
							setPendingTransaction(true);
						}).on('receipt', () => {
							setPendingTransaction(false);
							depositUserFightingFish(fish);
							setFishSelectionToShow(FishSelectionEnum.UserFightingFish)
						})
					);
					console.log("Batch call execute")
					approveAndDeposit.execute();
				} else {
					const approve = await FishFight.fishFactory?.methods.approve(FishFight.readFightingWaters.options.address, fish.tokenId).send({
						from: account,
						gasPrice: 1000000000,
						gasLimit: 500000,
					})
					console.log(approve)
					unityContext.addFishFight1(fish)
					const addToFightingWaters = await FishFight.fightingWaters?.methods.deposit(fish.tokenId).send({
						from: account,
						gasPrice: 1000000000,
						gasLimit: 800000,
					})
					console.log(addToFightingWaters)
					depositUserFightingFish(fish);
				}
				
				
				toast.success('Transaction done', {
					onClose: async () => {
						refetchBalance()
						// call to refresh userFish and userFightingWaters Fish
					},
				});
			} catch (error: any) {
				toast.error(error);
			}
		} else {
			toast.error('Connect your wallet');
		}
		setMySelectedFish(null)
	}

	const withdrawFish = async (fish : Fish) => {
		const secondsSinceEpoch = Math.round(Date.now() / 1000)
		if(fish.expireTime > secondsSinceEpoch) {
			const expireTime = (fish.expireTime - secondsSinceEpoch) / 60;
			const lockedFor = (Math.round(expireTime * 10) / 10).toFixed(1);
			toast.error(`Fish Locked for ${lockedFor} minutes`)
			return;
		}
		if (account && mySelectedFish != null) {
			try {
				// const approve = await FishFight.fishFactory?.methods.approve(FishFight.readFightingWaters.options.address, fish.tokenId).send({
				// 	from: account,
				// 	gasPrice: 1000000000,
				// 	gasLimit: 500000,
				// })
				// console.log(approve)
				// unityContext.addFishFight1(fish)
				await FishFight.fightingWaters?.methods.withdraw(fish.tokenId).send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 800000,
				}).on('transactionHash', () => {
					setPendingTransaction(true);
				}).on('receipt', (data: any) => {
					setPendingTransaction(false);
					withdrawUserFightingFish(fish);
					setFishSelectionToShow(FishSelectionEnum.UserFish)
					console.log(data)
				})
				toast.success('Transaction done', {
					onClose: async () => {
						refetchBalance()
						// call to refresh userFish and userFightingWaters Fish
					},
				});
			} catch (error: any) {
				toast.error(error);
			}
		} else {
			toast.error('Connect your wallet');
		}
		setMySelectedFish(null)
	}


	return (
		<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'
			>
			{mySelectedFish != null &&
			<OptionsContainer>
				{fishSelectionToShow === FishSelectionEnum.UserFightingFish ?
					<GameButton onClick={() => withdrawFish(mySelectedFish)}>{'Withdraw'}</GameButton>
					:
					<GameButton onClick={() => depositFish(mySelectedFish)}>{'Deposit'}</GameButton>
				}
				<GameButton onClick={() => selectAnother()}>{'Back to Fish'}</GameButton>
			</OptionsContainer>
			}
			<ContainerControls>
				<Menu name={FishViewOptions[fishSelectionToShow].name} items={FishViewOptions}></Menu>
				{fishSelectionToShow === FishSelectionEnum.UserFightingFish &&
					<StakedStatus></StakedStatus>
				}
			</ContainerControls>
			{fishSelectionToShow === FishSelectionEnum.UserFightingFish ?
				<FishViewer selectedFish={mySelectedFish} fishCollection={userFightingFish} onClick={setUserFish}></FishViewer>
				:
				<FishViewer selectedFish={mySelectedFish} fishCollection={userFish} onClick={setUserFish}></FishViewer>
			}
		</BaseOverlayContainer>
	);
};

interface GridProps {
	ref?: any;
}


const OptionsContainer = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
`;

const GameButton = styled.button`
	display: flex;
	flex-flow: column;
	justify-content: center;
	padding: 2.2vmin;
	border-radius: 25px;
	background-color: white;
	border: none;
	opacity: 0.7;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.25);
	color: black;
	margin-left: ${props => props.theme.spacing.gapSmall};
	transition: opacity 0.3s ease, box-shadow 0.25s ease-in-out;
	text-transform: uppercase;
	font-weight: bolder;
	text-decoration: none;
	font-size: ${props => props.theme.font.medium}vmin;
	pointer-events: auto;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;


export default UserFightingWaters;
