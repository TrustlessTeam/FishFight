import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { Fish } from '../utils/fish'
import { Fight} from '../utils/fight'
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import { ApprovalDisclaimer, ApprovalsContainer, BaseOverlayContainer, ContainerControls } from './BaseStyles';
import { ToggleGroup, ToggleOption } from './ToggleButton';
import { useContractWrapper } from '../context/contractWrapperContext';
import { useFishFight } from '../context/fishFightContext';
import Account from './Account';
import FishDrawer from './FishDrawer';
import BaseButton from "../components/BaseButton";

enum FishSelectionEnum {
  MyFish,
  FightFish
}

const FightingWaters = () => {
	// State
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);
	const [opponentFish, setOpponentFish] = useState<Fish | null>(null);
	const [fishSelectionToShow, setFishSelectionToShow] = useState<number>(FishSelectionEnum.FightFish);
	const [fightResult, setFightResult] = useState<Fight | null>();
	const [showFightingLocationResult, setshowFightingLocationResult] = useState(false);
	const [isFighting, setIsFighting] = useState<boolean>(false);
	const [renderedFish, setRenderedFish] = useState<number[]>([]);

	// Context
	const { userFish, fightingFish } = useFishPool()
	const { account } = useWeb3React();
	const unityContext = useUnity();
	const { fightFish, depositFightingFish, withdrawFightingFish, contractApproveAllForFighting, pendingTransaction} = useContractWrapper();
	const { fightingFishApproval, requireApproval, updateApproval } = useFishFight();

	useEffect(() => {
		unityContext.UnityInstance.on('UISelectionConfirm', function (data: any) {
			console.log('UI changed catch fish');
			console.log(data)
			switch (data) {
				case 'confirm':
					fightFish(mySelectedFish, opponentFish);
					return;
				default:
					return;
			}
			
		});

		unityContext.UnityInstance.on("UI_Fighting_Start_Request", function () {
      console.log("UI_Fighting_Start_Request!");
    });
	}, [unityContext.isFishPoolReady, account, mySelectedFish, opponentFish]);

	useEffect(() => {
		if(account) {
			setFishSelectionToShow(FishSelectionEnum.MyFish)
		} else {
			setFishSelectionToShow(FishSelectionEnum.FightFish)
		}
	}, [account]);

	useEffect(() => {
		console.log("Show Fighting Location")
		// unityContext.clearFishPool("Fighting")
		// unityContext.clearFishPool("Breeding")
		// unityContext.clearFishPool('Fish');
		unityContext.clearUIFish();
		unityContext.hideUI();
		unityContext.showFightingLocation();
		unityContext.showFightingUI();

	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		console.log("Fighting Fish Changed")
		console.log(fightingFish)
		if(!unityContext.isFishPoolReady) return;
		// unityContext.clearFishPool("ShowFighting")
		fightingFish.forEach(fish => {
			// unityContext.addFishFightingPool(fish);
		})
	}, [fightingFish, unityContext.isFishPoolReady]);


	const setUserFighter = async (fish : Fish) => {
		console.log("User Selected Fish: " + fish.tokenId)
		// unityContext.showFightingUI();
		if(fish.tokenId == opponentFish?.tokenId) {
			toast.error("Can't Fight the same Fish")
			return;
		}
		setMySelectedFish(fish);
		unityContext.addFishFight1(fish)
	}

	const setOpponentFighter = (fish : Fish) => {
		console.log("Opponent Fish: " + fish.tokenId)
		// unityContext.showFightingUI();
		if(fish.tokenId == mySelectedFish?.tokenId) {
			toast.error("Can't Fight the same Fish")
			return;
		}
		setOpponentFish(fish);
		unityContext.addFishFight2(fish)
	}

	const selectAnother = () => {
		setMySelectedFish(null);
		// unityContext.showFightingLocation(); // switch to FightingWaters view
	}

	useEffect(() => {
		unityContext.UnityInstance.on('FishPoolFightWinner', function () {
			console.log('Confirm FishPoolFightWinner');
			setshowFightingLocationResult(true);
		});
		unityContext.UnityInstance.on('FishPoolFightTie', function () {
			console.log('Confirm FishPoolFightTie');
			setshowFightingLocationResult(true);
		});
	}, [unityContext.isFishPoolReady]);

	const fightAgain = () => {
		setFightResult(null)
		setIsFighting(false)
		setMySelectedFish(null)
		setOpponentFish(null)
		setshowFightingLocationResult(false);
	}

	const ApprovalUI = () => {
		return (
			<ApprovalsContainer>
				<ApprovalDisclaimer>
					<p>Approval Required: Fighting contract approval to control your $FISH is required to Fight Fish.</p>
					<OptionsContainer>
						{!fightingFishApproval &&
							<BaseButton onClick={() => contractApproveAllForFighting()}>{'Approve $FISH'}</BaseButton>
						}
					</OptionsContainer>
					{/* <p>Use per Transaction Approval</p><button onClick={() => updateApproval(true)}></button> */}
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
					<ToggleOption className={fishSelectionToShow === FishSelectionEnum.FightFish ? 'active' : ''} onClick={() => setFishSelectionToShow(FishSelectionEnum.FightFish)}>Opponent $FISH</ToggleOption>
				</ToggleGroup>
			}
			</>
		)
	}

	if(!unityContext.isFishPoolReady) return null;

	return(
		<>
			{account && fightingFishApproval ?
				<BaseOverlayContainer
					active={pendingTransaction}
					spinner
					text='Waiting for confirmation...'
				>
					{account && userFish.length > 0 && fishSelectionToShow === FishSelectionEnum.MyFish && 
						<FishDrawer selectedFish={mySelectedFish} fishCollection={userFish} onClick={setUserFighter}>
							<ViewOptions></ViewOptions>
						</FishDrawer>
					}
					{/* {account && userFish.length === 0 && fishSelectionToShow === FishSelectionEnum.MyFish &&
						<BaseLinkButton to={'/catch'}>Catch a Fish!</BaseLinkButton>
					} */}
					{(fishSelectionToShow === FishSelectionEnum.FightFish || !account ) &&
						<FishDrawer depositFighter selectedOpponent={opponentFish} fishCollection={fightingFish} onClick={setOpponentFighter}>
							<ViewOptions></ViewOptions>
						</FishDrawer>
					}
				</BaseOverlayContainer>
					
				:

				<ApprovalsContainer
				active={pendingTransaction}
				spinner
				text='Waiting for confirmation...'
				>
					<ContainerControls>
						{!account &&
							<Account mobile={false} textOverride={"Connect Wallet to Fight $FISH"}/>
						}
						{account && 
						<ApprovalUI></ApprovalUI>
						}
					</ContainerControls>
				</ApprovalsContainer>
			}
		</>
		
	)
};

const OptionsContainer = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
`;



export default FightingWaters;
