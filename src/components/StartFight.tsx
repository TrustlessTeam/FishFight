import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import BN from 'bn.js';
import { Fish } from '../utils/fish'
import { Fight} from '../utils/fight'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import { Unit } from '@harmony-js/utils';
import FishNFT from './FishNFT';
import { useFishPool } from '../context/fishPoolContext';
import { BaseContainer, ContainerControls,  BaseButton, BaseOverlayContainer } from './BaseStyles';
import FishViewer from './FishViewer';
import Menu, { MenuItem } from './Menu';
import web3 from 'web3';

enum FishSelectionEnum {
  UserFightingFish,
  UserFish
}

enum FighterSelectionEnum {
  MyFighter,
	OpponentFighter
}

const StartFight = () => {
	const { FishFight, refetchBalance } = useFishFight()
	const { userFish, fightingFish, userFightingFish, refreshFish } = useFishPool()

	// Fish selected for fight
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);
	const [opponentFish, setOpponentFish] = useState<Fish | null>(null);
	const [fighterSelectionToShow, setFighterSelectionToShow] = useState<number>(FighterSelectionEnum.MyFighter);
	const [fishSelectionToShow, setFishSelectionToShow] = useState<number>(FishSelectionEnum.UserFightingFish);
	const [fightResult, setFightResult] = useState<Fight | null>();
	const [showFightingLocationResult, setshowFightingLocationResult] = useState(false);
	const [isFighting, setIsFighting] = useState<boolean>(false);
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);


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

	const FighterSelectionOptions: MenuItem[] = [
		{
			name: 'My $FISH',
			onClick: () => setFighterSelectionToShow(FighterSelectionEnum.MyFighter)
		},
		{
			name: 'Opponent $FISH',
			onClick: () => setFighterSelectionToShow(FighterSelectionEnum.OpponentFighter)
		}
	]

	useEffect(() => {
		unityContext.showFightingLocation();
	}, [unityContext.isFishPoolReady]);

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

	const getUserFight = async (fightIndex: number) => {
		const fightInfo = await FishFight.fightingWaters?.methods.getFightInfo(fightIndex).call();
		const newFight = new Fight(
			new BN(fightInfo.typeOfFight).toNumber(),
			new BN(fightInfo.fishChallenger).toNumber(),
			new BN(fightInfo.fishChallenged).toNumber(),
			new BN(fightInfo.timeOfFight).toNumber(),
			fightInfo.round1,
			fightInfo.round2,
			fightInfo.round3,
			new BN(fightInfo.winner).toNumber()
		);
		unityContext.sendRound(1, newFight.round1.value);
		unityContext.sendRound(2, newFight.round2.value);
		unityContext.sendRound(3, newFight.round3.value);
		if(newFight.winner == mySelectedFish?.tokenId) {
			unityContext.sendWinner(mySelectedFish);
			// depositUserFightingFish(mySelectedFish);
		}
		else if(newFight.winner == opponentFish?.tokenId) {
			unityContext.sendWinner(opponentFish);
		}
		else if(newFight.winner == 0) {
			unityContext.sendTie()
		}
		setFightResult(newFight)
		refreshFish(newFight.winner, true, false);
	}

	const setOpponent = (fish : Fish) => {
		console.log("Opponent Fish: " + fish.tokenId)
		//unityContext.clearFishPool('showFightingLocation');
		if(mySelectedFish != null) {
			unityContext.addFishFight2(mySelectedFish);
		}
		setOpponentFish(fish);
		unityContext.addFishFight2(fish)
	}

	const setUserFish = async (fish : Fish) => {
		console.log("UserSelected Fish: " + fish.tokenId)
		//unityContext.clearFishPool('showFightingLocation');
		if(opponentFish != null) {
			unityContext.addFishFight1(opponentFish);
		}
		setMySelectedFish(fish);
		unityContext.addFishFight1(fish)
	}

	const isDeposited = async (tokenId: number) => {
		const owner = await FishFight.readFishFactory.methods.ownerOf(tokenId).call();
		console.log(owner)
		console.log(FishFight.readFishingWaters.options.address)
		return owner == FishFight.readFightingWaters.options.address;
	}

	const contractApproveAll = () => {
		return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWaters.options.address, true).send({
			from: account,
			gasPrice: 30000000000,
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
			console.log('Approval completed')
			toast.success('Approval Completed')
		})
	}

	const contractDeathFight = (myFish: Fish, opponentFish: Fish, isDeposited: boolean) => {
		return FishFight.fightingWaters?.methods.deathFight(myFish.tokenId, opponentFish.tokenId, isDeposited).send({
			from: account,
			gasPrice: 30000000000,
			gasLimit: 5000000,
			value: new Unit(1).asOne().toWei()
		}).on('transactionHash', () => {
			setPendingTransaction(true);
			setIsFighting(true);
		}).on('receipt', async (result: any) => {
			// console.log(result)
			setIsFighting(false)
			const fightIndex = web3.utils.toNumber(result.events.FightCompleted.returnValues._fightIndex);
			setPendingTransaction(false);
			await getUserFight(fightIndex);
			toast.success('Fight Commpleted!', {
				onClose: async () => {
					refetchBalance()
				},
			});
		})
	}

	const fightFish = async () => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(mySelectedFish == null) {
			toast.error('Select your Fighter');
			return;
		}
		if(opponentFish == null) {
			toast.error('Select your opponent');
			return;
		}

		try {
			const deposited = await isDeposited(mySelectedFish.tokenId);
			// Must approve not deposited fish before fighting, then trigger death fight with deposit flag = true
			if(deposited) {
				contractDeathFight(mySelectedFish, opponentFish, false);
			}
			else { // If User selected fish is already deposited, we can just fight them
				FishFight.fishFactory?.methods.isApprovedForAll(account, FishFight.readFightingWaters.options.address).call()
				.then((isApproved: boolean) => {
					if(isApproved) {
						contractDeathFight(mySelectedFish, opponentFish, true);
					} else {
						contractApproveAll()
						.on('receipt', () => {
							contractDeathFight(mySelectedFish, opponentFish, true);
						})
					}
				})
			}
		} catch (error: any) {
			console.log(error);
			// toast.error(error);
			// setIsFighting(false);
			// setMySelectedFish(null);
			// setOpponentFish(null);
			// setPendingTransaction(false);
		}
	};

	const fightAgain = () => {
		setFightResult(null)
		setIsFighting(false)
		setMySelectedFish(null)
		setOpponentFish(null)
		setshowFightingLocationResult(false);
	}

	return (
		<>
		{/* Select Fish to Fight */}
		{!fightResult && !isFighting &&
			<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'>
				{
					<FightGrid>
						{mySelectedFish &&
							<FishNFT selectedUser={true} fish={mySelectedFish}></FishNFT>
						}
						<VersusContainer>
							<Text>VS</Text>
							{mySelectedFish != null && opponentFish != null ?
								<BaseButton onClick={() => fightFish()}>
									Fight Fish
								</BaseButton>
								:
								<Text>Select Fish to Fight</Text>
							}
						</VersusContainer>
						{opponentFish &&
							<FishNFT selectedOpponent={true} fish={opponentFish}></FishNFT>
						}
					</FightGrid>
				}
				<ContainerControls>
					<Menu name={FighterSelectionOptions[fighterSelectionToShow].name} items={FighterSelectionOptions}></Menu>
					{/* {fighterSelectionToShow === FighterSelectionEnum.MyFighter &&
						<Menu name={FishViewOptions[fishSelectionToShow].name} items={FishViewOptions}></Menu>
					} */}
				</ContainerControls>
				{fighterSelectionToShow === FighterSelectionEnum.MyFighter &&
					<FishViewer selectedFish={mySelectedFish} fishCollection={fishSelectionToShow === FishSelectionEnum.UserFightingFish ? userFightingFish : userFish} onClick={setUserFish}></FishViewer>
				}
				{fighterSelectionToShow === FighterSelectionEnum.OpponentFighter &&
					<FishViewer selectedOpponent={opponentFish} fishCollection={fightingFish} onClick={setOpponent}></FishViewer>
				}
			</BaseOverlayContainer>
		}

		{/* Fish are Fighting */}
		{isFighting && mySelectedFish && opponentFish &&
			<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'>
				<FightGrid >
					<FishNFT selectedUser={true} fish={mySelectedFish}></FishNFT>
					<VersusContainer>
						<Text>VS</Text>
						<Text>Awaiting results from blockchain...</Text>
					</VersusContainer>
					<FishNFT selectedOpponent={true} fish={opponentFish}></FishNFT>
				</FightGrid>
			</BaseOverlayContainer>
		}

		{/* Show Fight Results */}
		{fightResult && mySelectedFish && opponentFish &&
			<BaseContainer>
				<ContainerControls>
					<BaseButton onClick={() => fightAgain()}>
						Fight Another Fish!
					</BaseButton>
				</ContainerControls>
				<FightGrid>
					<FishNFT selectedUser={true} fish={mySelectedFish}></FishNFT>
					{showFightingLocationResult ? 
					<ResultContainer>
						<ResultData>Results</ResultData>
						<ResultData>Round 1: {fightResult.round1.description}</ResultData>
						<ResultData>Round 2: {fightResult.round2.description}</ResultData>
						<ResultData>Round 3: {fightResult.round3.description}</ResultData>
						<ResultData>Winner: {fightResult.winner}</ResultData>
					</ResultContainer>
					:
					<VersusContainer><Text>Fight Starting!</Text></VersusContainer>
					}
					
					<FishNFT selectedOpponent={true} fish={opponentFish}></FishNFT>
				</FightGrid>
			</BaseContainer>
		}
		</>
	);
};

const VersusContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const FightGrid = styled.div`
	display: flex;
	flex-direction: row nowrap;
	justify-content: center;
	/* height: 72%; */
	overflow-y: hidden;
	overflow-x: auto;
	pointer-events: auto;
`;

const Text = styled.p`
	display: flex;
	flex-flow: column;
	justify-content: center;
	padding: ${props => props.theme.spacing.gap};
	margin: 0;
	background-color: white;
	font-size: ${props => props.theme.font.large};
	border-radius: 25px;
	margin-left: ${props => props.theme.spacing.gapSmall};
`;

const ResultData = styled.p`
	color: ${"black"};
	font-size: ${props => props.theme.font.medium};
	margin: 0;
`;

const ResultContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: white;
	padding: ${props => props.theme.spacing.gap};
	margin: ${props => props.theme.spacing.gap};
	border-radius: 25px;
`;



export default StartFight;
