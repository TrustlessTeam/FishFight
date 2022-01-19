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
import { BaseContainer, ContainerControls, BaseOverlayContainer } from './BaseStyles';
import StakedBreedStatus from './StakedBreedStatus';
import web3 from 'web3';


enum FishSelectionEnum {
  UserBreedingFish,
  UserFish
}

const UserBreedingWaters = () => {
	const { FishFight, refetchBalance } = useFishFight()
	const { userFish, userBreedingFish, breedingFish, depositUserBreedingFish, withdrawUserBreedingFish } = useFishPool()
	const [fishSelectionToShow, setFishSelectionToShow] = useState<number>(FishSelectionEnum.UserBreedingFish);
	const [renderedFish, setRenderedFish] = useState<number[]>([]);
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);


	// Fish selected for fight
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);

	// Context
	const { account } = useWeb3React();
	const unityContext = useUnity();

	const FishViewOptions: MenuItem[] = [
		{
			name: 'My Staked Alpha Fish',
			onClick: () => setFishSelectionToShow(FishSelectionEnum.UserBreedingFish)
		},
		{
			name: 'My Alpha Fish',
			onClick: () => setFishSelectionToShow(FishSelectionEnum.UserFish)
		}
	]

	useEffect(() => {
		console.log("UserBreedingFish")
		unityContext.showBreeding();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		console.log("Breeding Fish Changed")
		console.log(userFish)
		console.log(userBreedingFish)
		console.log(breedingFish)

		if(!unityContext.isFishPoolReady) return;
		let i = 0;
		userFish.forEach(fish => {
			if(!renderedFish.includes(fish.tokenId)) {
				unityContext.addFishBreedingPool(fish);
				setRenderedFish(prevData => [...prevData, fish.tokenId])
				i++;
			}
		})
		console.log(i)
	}, [breedingFish, userBreedingFish, userFish, unityContext.isFishPoolReady]);

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

	const contractApproveAll = () => {
		return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readBreedingWaters.options.address, true).send({
			from: account,
			gasPrice: 1000000000,
			gasLimit: 500000,
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Approval Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', () => {
			console.log('Breeding Approval completed')
			toast.success('Breeding Approval completed')
		})
	}

	const contractDeposit = (fish: Fish) => {
		return FishFight.breedingWaters?.methods.deposit(fish.tokenId).send({
			from: account,
			gasPrice: 1000000000,
			gasLimit: 800000,
		})
		.on('error', (error: any) => {
			console.log(error)
			toast.error('Deposit Failed');
			setPendingTransaction(false);
		})
		.on('transactionHash', () => {
			setPendingTransaction(true);
		})
		.on('receipt', async () => {
			setPendingTransaction(false);
			depositUserBreedingFish(fish);
			setFishSelectionToShow(FishSelectionEnum.UserBreedingFish)
			setMySelectedFish(null)
			toast.success('Fish Deposited', {
				onClose: async () => {
					refetchBalance()
				},
			});
		})
	}

	const depositFish = async (fish : Fish) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(mySelectedFish == null) {
			toast.error('Select a Fish');
			return;
		}
		try {
			FishFight.fishFactory?.methods.isApprovedForAll(account, FishFight.readBreedingWaters.options.address).call()
			.then((isApproved: boolean) => {
				if(isApproved) {
					contractDeposit(fish);
				} else {
					contractApproveAll()
					.on('receipt', () => {
						contractDeposit(fish);
					})
				}
			})
		} catch (error: any) {
			console.log(error)
		}
	}

	const withdrawFish = async (fish : Fish) => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(mySelectedFish == null) {
			toast.error('Select a Fish');
		}
		try {
			await FishFight.breedingWaters?.methods.withdraw(fish.tokenId).send({
				from: account,
				gasPrice: 1000000000,
				gasLimit: 800000,
			})
			.on('transactionHash', () => {
				setPendingTransaction(true);
			})
			.on('receipt', async (data: any) => {
				setPendingTransaction(false);
				withdrawUserBreedingFish(fish);
				setFishSelectionToShow(FishSelectionEnum.UserFish)
				toast.success('Transaction done', {
					onClose: async () => {
						refetchBalance()
						// refreshFish(fish.tokenId, false, false)
					},
				});
			})
		} catch (error: any) {
			toast.error(error);
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
				{fishSelectionToShow === FishSelectionEnum.UserBreedingFish ?
					<GameButton onClick={() => withdrawFish(mySelectedFish)}>{'Withdraw'}</GameButton>
					:
					<GameButton onClick={() => depositFish(mySelectedFish)}>{'Deposit'}</GameButton>
				}
				<GameButton onClick={() => selectAnother()}>{'Back to Fish'}</GameButton>
			</OptionsContainer>
			}
			<ContainerControls>
				<Menu name={FishViewOptions[fishSelectionToShow].name} items={FishViewOptions}></Menu>
				{/* {fishSelectionToShow === FishSelectionEnum.UserBreedingFish &&
					<StakedBreedStatus></StakedBreedStatus>
				} */}
			</ContainerControls>
			{fishSelectionToShow === FishSelectionEnum.UserBreedingFish ?
				<FishViewer selectedFish={mySelectedFish} fishCollection={userBreedingFish} onClick={setUserFish}></FishViewer>
				:
				<FishViewer selectedFish={mySelectedFish} fishCollection={userFish.filter((fish) => fish.seasonStats != null ? fish.seasonStats?.fightWins > 0 : false)} onClick={setUserFish}></FishViewer>
			}
		</BaseOverlayContainer>
	);
};


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
	font-size: ${props => props.theme.font.medium};
	pointer-events: auto;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;


export default UserBreedingWaters;
