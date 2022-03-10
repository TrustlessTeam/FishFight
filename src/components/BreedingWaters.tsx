import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { Fish } from '../utils/fish'
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import FishViewer from './FishViewer';
import {  BaseLinkButton, BaseOverlayContainer, ContainerControls, ApprovalsContainer, BaseButton, ApprovalDisclaimer } from './BaseStyles';
import { ToggleGroup, ToggleOption } from './ToggleButton';
import { useContractWrapper } from '../context/contractWrapperContext';
import { useFishFight } from '../context/fishFightContext';
import ConnectWallet from './ConnectWallet';
import Account from './Account';
import web3 from 'web3';
import { Constants } from '../utils/constants';
import FishDrawer from './FishDrawer';

enum FishSelectionEnum {
  MyFish,
  AlphaFish
}

const BreedingWaters = () => {
	// State
	const [fishSelectionToShow, setFishSelectionToShow] = useState<number>(FishSelectionEnum.AlphaFish);
	const [myBettaFish, setMyBettaFish] = useState<Fish | null>(null);
	const [alphaFish, setAlphaFish] = useState<Fish | null>(null);

	const [breedResult, setBreedResult] = useState<Fish | null>();
	const [showBreedResult, setShowBreedResult] = useState(false);
	const [isBreeding, setIsBreeding] = useState<boolean>(false);

	// Context
	const unityContext = useUnity();
	const { account } = useWeb3React();
	const { userFish, breedingFish } = useFishPool()
	const { breedFish, depositBreedingFish, withdrawBreedingFish, contractApproveFoodForBreeding, contractApproveAllFishForBreeding, pendingTransaction} = useContractWrapper();
	const { breedingFishApproval, breedingFoodApproval, currentPhase } = useFishFight();

	useEffect(() => {
		console.log("Breeding Fish")
		unityContext.clearUIFish();
		// unityContext.clearFishPool("ShowBreeding")
		unityContext.hideUI();
		unityContext.showBreedingLocation();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		console.log("Breeding Fish Changed")
		console.log(breedingFish)
		if(!unityContext.isFishPoolReady) return;
		breedingFish.forEach(fish => {
			unityContext.addFishBreedingPool(fish);
		})
	}, [breedingFish, unityContext.isFishPoolReady]);

	useEffect(() => {
		if(!unityContext.isFishPoolReady) return;
		unityContext.UnityInstance.on('UISelectionConfirm', function (data: any) {
			// console.log('UI changed catch fish');
			console.log(account)
			console.log(myBettaFish)
			console.log(data)
			switch (data) {
				case 'breed_confirm':
					breedFish(alphaFish, myBettaFish);
					return;
				default:
					return;
			}
			
		});
	}, [unityContext.isFishPoolReady, account, alphaFish, myBettaFish]);

	useEffect(() => {
		unityContext.UnityInstance.on('UI_Breeding_Start_Request', function () {
			console.log('Confirm UI_Breeding_Start_Request');
			// setShowBreedResult(true);
		});
	}, [unityContext.isFishPoolReady]);

	const setAlpha = (fish : Fish) => {
		// const secondsSinceEpoch = Math.round(Date.now() / 1000)
		// if(fish.power < Constants._alphaBreedPowerFee) {
		// 	setAlphaFish(fish);
		// 	toast.error(`Alpha Fish has ${fish.power} power, at least ${Constants._alphaBreedPowerFee} power required to breed!`)
		// 	return;
		// }
		if(fish.fishModifiers.alphaModifier.uses === 0) {
			setAlphaFish(fish);
			toast.error(`Not Alpha this Season`)
			return;
		}
		console.log("Alpha Fish: " + fish.tokenId)
		unityContext.showBreedingUI();
		setAlphaFish(fish);
		unityContext.addFishBreed2(fish)
	}

	const setUserBetta = async (fish : Fish) => {
		if(fish.stakedFighting) {
			toast.error('Withdraw from Fight Pool');
			setMyBettaFish(fish);
			return;
		} 
		if(fish.fishModifiers.alphaModifier.uses > 0 && fish.stakedBreeding) {
			toast.error('Already in Alpha Pool');
			setMyBettaFish(fish);
			return;
		}
		// if(fish.parentA > 0 && currentSeason != null && fish.birthTime > currentSeason?.startTs) {
		// 	console.log(fish.birthTime)
		// 	console.log(currentSeason.startTs)
		// 	toast.error('Too Young');
		// 	return;
		// }
		if(fish.stakedBreeding && fish.fishModifiers.alphaModifier.uses > 0) {
			toast.error('Not betta fish');
			setMyBettaFish(fish);
			return;
		}
		if(fish.stakedBreeding && fish.fishModifiers.inBettaCooldown()) {
			toast.error('In breed cooldown');
			setMyBettaFish(fish);
			return;
		}
		if(fish.power < Constants._bettaBreedPowerFee) {
			setMyBettaFish(fish);
			toast.error(`Betta Fish has ${fish.power} power, at least ${Constants._bettaBreedPowerFee} power required to breed!`)
			return;
		}

		console.log("Betta Fish: " + fish.tokenId)
		unityContext.showBreedingUI();
		setMyBettaFish(fish);
		unityContext.addFishBreed1(fish)
	}

	const breedAgain = () => {
		setBreedResult(null)
		setIsBreeding(false)
		setMyBettaFish(null)
		setAlphaFish(null)
		setShowBreedResult(false);
		unityContext.showFightingLocation();
	}

	const ApprovalUI = () => {
		return (
			<ApprovalsContainer>
				<ApprovalDisclaimer>
					<p>Approval Required: Breeding contract approval to control your $FISH and send $FISHFOOD is required to Breed Fish.</p>
					<OptionsContainer>
					{!breedingFishApproval &&
						<BaseButton onClick={() => contractApproveAllFishForBreeding()}>{'Approve $FISH'}</BaseButton>
					}
					{!breedingFoodApproval &&
						<BaseButton onClick={() => contractApproveFoodForBreeding()}>{'Approve $FISHFOOD'}</BaseButton>
					}
				</OptionsContainer>
				</ApprovalDisclaimer>
				
			</ApprovalsContainer>	
		)
	}

	const ViewOptions = () => {
		return (
			<>
			{account &&
				<ToggleGroup>
					<ToggleOption className={fishSelectionToShow === FishSelectionEnum.MyFish ? 'active' : ''} onClick={() => setFishSelectionToShow(FishSelectionEnum.MyFish)}>My $FISH</ToggleOption>
					<ToggleOption className={fishSelectionToShow === FishSelectionEnum.AlphaFish ? 'active' : ''} onClick={() => setFishSelectionToShow(FishSelectionEnum.AlphaFish)}>Alpha $FISH</ToggleOption>
				</ToggleGroup>
			}
			</>
		)
	}


	if(!unityContext.isFishPoolReady) return null;

	return(
		<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'
			>
				{account && breedingFishApproval && breedingFoodApproval ?
					<>
						{myBettaFish != null &&
						<OptionsContainer>
							{/* {myBettaFish.stakedBreeding &&
								<GameButton onClick={() => withdrawBreedingFish(myBettaFish)}>{'Withdraw Breeder'}</GameButton>
							}
							{myBettaFish.seasonStats.fightWins > 0 && !myBettaFish.stakedFighting &&
								<GameButton onClick={() => depositBreedingFish(myBettaFish)}>{'Deposit'}</GameButton>
							} */}
							{myBettaFish && alphaFish &&
								<BaseButton onClick={() => breedFish(alphaFish, myBettaFish)}>{'Breed Fish'}</BaseButton>
							}
						</OptionsContainer>
						}
						{account && userFish.length > 0 && fishSelectionToShow === FishSelectionEnum.MyFish && 
							<FishDrawer type="Breeding" selectedFish={myBettaFish} fishCollection={userFish} onClick={setUserBetta}>
								<ViewOptions></ViewOptions>
							</FishDrawer>
						}
						{account && userFish.length === 0 && fishSelectionToShow === FishSelectionEnum.MyFish &&
							<BaseLinkButton to={'/catch'}>Catch a Fish!</BaseLinkButton>
						}
						{(fishSelectionToShow === FishSelectionEnum.AlphaFish || !account ) &&
							<FishDrawer selectedOpponent={alphaFish} fishCollection={breedingFish} onClick={setAlpha}>
								<ViewOptions></ViewOptions>
							</FishDrawer>
						}
					</>

					:

					<ApprovalsContainer
						active={pendingTransaction}
						spinner
						text='Waiting for confirmation...'
					>
						<ContainerControls>
							{!account &&
								<Account mobile={false} textOverride={"Connect Wallet to Breed $FISH"}/>
							}
							{account && 
							<ApprovalUI></ApprovalUI>
							}
						</ContainerControls>
					</ApprovalsContainer>
				}
				
			</BaseOverlayContainer>
	);
	

	// return (
	// 	<BaseOverlayContainer
	// 		active={pendingTransaction}
	// 		spinner
	// 		text='Waiting for confirmation...'
	// 		>
	// 		{!account &&
				
	// 		<ContainerControls>
	// 			<Account mobile={false} textOverride={"Connect"}/>
	// 		</ContainerControls>
	// 		}
	// 		{account && ! breedingFishApproval && breedingFoodApproval && 
	// 			<ApprovalUI></ApprovalUI>
	// 		}
	// 		{account && breedingFishApproval && breedingFoodApproval &&
	// 			<BreederSelection></BreederSelection>
	// 		}
			
	// 	</BaseOverlayContainer>
	// );
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

export default BreedingWaters;
