import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { Fish } from '../utils/fish'
import { Fight} from '../utils/fight'
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import FishViewer from './FishViewer';
import { ApprovalDisclaimer, ApprovalsContainer, BaseButton, BaseLinkButton, BaseOverlayContainer, ContainerControls } from './BaseStyles';
import { ToggleGroup, ToggleOption } from './ToggleButton';
import { useContractWrapper } from '../context/contractWrapperContext';
import { useFishFight } from '../context/fishFightContext';
import ConnectWallet from './ConnectWallet';
import Account from './Account';

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

	const FighterSelection = () => {
		return (
			<>
				{account && userFish.length > 0 && fishSelectionToShow === FishSelectionEnum.MyFish && 
					<FishViewer type="Fighting" selectedFish={mySelectedFish} fishCollection={userFish} onClick={setUserFighter}>
						<ViewOptions></ViewOptions>
					</FishViewer>
				}
				{account && userFish.length === 0 && fishSelectionToShow === FishSelectionEnum.MyFish &&
					<BaseLinkButton to={'/catch'}>Catch a Fish!</BaseLinkButton>
				}
				{(fishSelectionToShow === FishSelectionEnum.FightFish || !account ) &&
					<FishViewer depositFighter selectedOpponent={opponentFish} fishCollection={fightingFish} onClick={setOpponentFighter}>
						<ViewOptions></ViewOptions>
					</FishViewer>
				}
			</>
		)
	}

	if(!unityContext.isFishPoolReady) return null;

	if(account && fightingFishApproval) {
		return (
			<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'
			>
			{!isFighting && !showFightingLocationResult && !fightResult	&&
				<FighterSelection />
			}
		</BaseOverlayContainer>
			
		)
	} else {
		return (
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
		)
	}
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


export default FightingWaters;
