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
			name: 'My Breeding Fish',
			onClick: () => setFishSelectionToShow(FishSelectionEnum.UserBreedingFish)
		},
		{
			name: 'My Fish',
			onClick: () => setFishSelectionToShow(FishSelectionEnum.UserFish)
		}
	]

	useEffect(() => {
		console.log("UserBreedingFish")
		unityContext.showFight();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		console.log("Breeding Fish Changed")
		console.log(userFish)
		console.log(userBreedingFish)
		console.log(breedingFish)

		if(!unityContext.isFishPoolReady) return;
		let i = 0;
		breedingFish.forEach(fish => {
			if(!renderedFish.includes(fish.tokenId)) {
				unityContext.addFishOcean(fish);
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

	const contractApprove = (fish: Fish) => {
		return FishFight.fishFactory?.methods.approve(FishFight.readBreedingWaters.options.address, fish.tokenId).send({
			from: account,
			gasPrice: 1000000000,
			gasLimit: 500000,
		}).on('transactionHash', () => {
			setPendingTransaction(true);
		})
	}

	const depositFish = async (fish : Fish) => {
		if (account && mySelectedFish != null) {
			try {
				const approve = await FishFight.fishFactory?.methods.approve(FishFight.readBreedingWaters.options.address, fish.tokenId).send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 500000,
				})
				console.log(approve)
				unityContext.addFishFight1(fish)
				const addToBreedingWaters = await FishFight.breedingWaters?.methods.deposit(fish.tokenId).send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 800000,
				})
				console.log(addToBreedingWaters)
				await depositUserBreedingFish(fish);
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
		if (account && mySelectedFish != null) {
			try {
				// const approve = await FishFight.fishFactory?.methods.approve(FishFight.readFightingWaters.options.address, fish.tokenId).send({
				// 	from: account,
				// 	gasPrice: 1000000000,
				// 	gasLimit: 500000,
				// })
				// console.log(approve)
				// unityContext.addFishFight1(fish)
				const withdrawBreedingWaters = await FishFight.breedingWaters?.methods.withdraw(fish.tokenId).send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 800000,
				})
				console.log(withdrawBreedingWaters)
				await withdrawUserBreedingFish(fish);
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
		<BaseContainer>
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
		</BaseContainer>
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
	font-size: ${props => props.theme.font.medium}vmin;
	pointer-events: auto;

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;


export default UserBreedingWaters;
