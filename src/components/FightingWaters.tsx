import { useEffect, useState } from 'react';
import { Link, Routes, Route } from "react-router-dom";
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { Fish } from '../utils/fish'
import { Fight} from '../utils/fight'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import FishViewer from './FishViewer';
import Menu, { MenuItem } from './Menu';
import StakedStatus from './StakedStatus';
import { BaseContainer, BaseLinkButton, BaseOverlayContainer, ContainerControls } from './BaseStyles';
import LoadingOverlay from 'react-loading-overlay';
import web3 from 'web3';
import BN from 'bn.js';
import { ToggleGroup, ToggleOption } from './ToggleButton';


enum FishSelectionEnum {
  MyFish,
  FightFish
}

const FightingWaters = () => {
	const { FishFight, refetchBalance } = useFishFight()
	const { userFish, fightingFish, depositUserFightingFish, withdrawUserFightingFish, refreshFish } = useFishPool()
	const [showOpponentSelection, setShowOpponentSelection] = useState<boolean>(false);
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);
	const [opponentFish, setOpponentFish] = useState<Fish | null>(null);
	// const [fighterSelectionToShow, setFighterSelectionToShow] = useState<number>(FishViewOptions.MyFish);
	const [fishSelectionToShow, setFishSelectionToShow] = useState<number>(FishSelectionEnum.FightFish);
	const [fightResult, setFightResult] = useState<Fight | null>();
	const [showFightResult, setShowFightResult] = useState(false);
	const [isFighting, setIsFighting] = useState<boolean>(false);
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);
	const [renderedFish, setRenderedFish] = useState<number[]>([]);

	// Context
	const { account } = useWeb3React();
	const unityContext = useUnity();

	const FishViewOptions: MenuItem[] = [
		{
			name: 'My $FISH',
			onClick: () => setFishSelectionToShow(FishSelectionEnum.MyFish)
		},
		{
			name: 'Fight Pool $FISH',
			onClick: () => setFishSelectionToShow(FishSelectionEnum.FightFish)
		}
	]

	useEffect(() => {
		if(account) {
			setFishSelectionToShow(FishSelectionEnum.MyFish)
		} else {
			setFishSelectionToShow(FishSelectionEnum.FightFish)
		}
	}, [account]);

	useEffect(() => {
		console.log("MyFish")
		unityContext.showFight();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		console.log("Fightintg Fish Changed")
		console.log(fightingFish)
		console.log(userFish)
		if(!unityContext.isFishPoolReady) return;
		let i = 0;
		fightingFish.forEach(fish => {
			if(!renderedFish.includes(fish.tokenId)) {
				unityContext.addFishFightingPool(fish);
				setRenderedFish(prevData => [...prevData, fish.tokenId])
				i++;
			}
		})
		console.log(i)
	}, [fightingFish, userFish, unityContext.isFishPoolReady]);


	const setUserFighter = async (fish : Fish) => {
		console.log("User Selected Fish: " + fish.tokenId)
		//unityContext.clearFishPool('ShowFight');
		// if(opponentFish != null) {
		// 	unityContext.addFishFight1(opponentFish);
		// }
		setMySelectedFish(fish);
		unityContext.addFishFight1(fish)
	}

	const setOpponentFighter = (fish : Fish) => {
		console.log("Opponent Fish: " + fish.tokenId)
		//unityContext.clearFishPool('ShowFight');
		// if(mySelectedFish != null) {
		// 	unityContext.addFishFight2(mySelectedFish);
		// }
		setOpponentFish(fish);
		unityContext.addFishFight2(fish)
	}

	const selectAnother = () => {
		setMySelectedFish(null);
		// unityContext.showFight(); // switch to FightingWaters view
	}

	useEffect(() => {
		unityContext.UnityInstance.on('FishPoolFightWinner', function () {
			console.log('Confirm FishPoolFightWinner');
			setShowFightResult(true);
		});
		unityContext.UnityInstance.on('FishPoolFightTie', function () {
			console.log('Confirm FishPoolFightTie');
			setShowFightResult(true);
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
			depositUserFightingFish(mySelectedFish);
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

	

	

	const isDeposited = async (tokenId: number) => {
		const owner = await FishFight.readFishFactory.methods.ownerOf(tokenId).call();
		console.log(owner)
		console.log(FishFight.readFishingWaters.options.address)
		return owner == FishFight.readFightingWaters.options.address;
	}

	// const contractApproveAll = () => {
	// 	return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWaters.options.address, true).send({
	// 		from: account,
	// 		gasPrice: 1000000000,
	// 		gasLimit: 500000,
	// 	})
	// 	.on('error', (error: any) => {
	// 		console.log(error)
	// 		toast.error('Approval Failed');
	// 		setPendingTransaction(false);
	// 	})
	// 	.on('transactionHash', () => {
	// 		setPendingTransaction(true);
	// 	})
	// 	.on('receipt', () => {
	// 		console.log('Approval completed')
	// 		toast.success('Approval Completed')
	// 	})
	// }

	const contractDeathFight = (myFish: Fish, opponentFish: Fish, isDeposited: boolean) => {
		return FishFight.fightingWaters?.methods.deathFight(myFish.tokenId, opponentFish.tokenId, isDeposited).send({
			from: account,
			gasPrice: 1000000000,
			gasLimit: 5000000,
			value: web3.utils.toWei('1')
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
		setShowFightResult(false);
	}

	const contractApproveAll = () => {
		return FishFight.fishFactory?.methods.setApprovalForAll(FishFight.readFightingWaters.options.address, true).send({
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
			console.log('Fighting Approval completed')
			toast.success('Fighting Approval completed')
		})
	}

	const contractDeposit = (fish: Fish) => {
		return FishFight.fightingWaters?.methods.deposit(fish.tokenId).send({
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
			depositUserFightingFish(fish);
			setFishSelectionToShow(FishSelectionEnum.MyFish);
			setMySelectedFish(null);
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
			FishFight.fishFactory?.methods.isApprovedForAll(account, FishFight.readFightingWaters.options.address).call()
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
		const secondsSinceEpoch = Math.round(Date.now() / 1000)
		if(fish.stakedFighting != null && fish.stakedFighting.lockedExpire > secondsSinceEpoch) {
			const expireTime = (fish.stakedFighting.lockedExpire - secondsSinceEpoch) / 60;
			const lockedFor = (Math.round(expireTime * 10) / 10).toFixed(1);
			toast.error(`Fish Locked for ${lockedFor} minutes`)
			return;
		}
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(mySelectedFish == null) {
			toast.error('Select a Fish');
		}

		try {
			await FishFight.fightingWaters?.methods.withdraw(fish.tokenId).send({
				from: account,
				gasPrice: 1000000000,
				gasLimit: 800000,
			}).on('transactionHash', () => {
				setPendingTransaction(true);
			}).on('receipt', async (data: any) => {
				setPendingTransaction(false);
				withdrawUserFightingFish(fish);
				setFishSelectionToShow(FishSelectionEnum.FightFish)
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
				{mySelectedFish.stakedFighting ?
					<GameButton onClick={() => withdrawFish(mySelectedFish)}>{'Withdraw'}</GameButton>
					:
					<GameButton onClick={() => depositFish(mySelectedFish)}>{'Deposit'}</GameButton>
				}
				{mySelectedFish && opponentFish &&
					<GameButton onClick={fightFish}>{'Start Fight'}</GameButton>
				}
				{/* <GameButton onClick={() => selectAnother()}>{'Back to Fish'}</GameButton> */}
			</OptionsContainer>
			}
			<ContainerControls>
				{account &&
					<ToggleGroup>
						<ToggleOption className={fishSelectionToShow === FishSelectionEnum.MyFish ? 'active' : ''} onClick={() => setFishSelectionToShow(FishSelectionEnum.MyFish)}>My $FISH</ToggleOption>
						<ToggleOption className={fishSelectionToShow === FishSelectionEnum.FightFish ? 'active' : ''} onClick={() => setFishSelectionToShow(FishSelectionEnum.FightFish)}>Opponent $FISH</ToggleOption>
					</ToggleGroup>
				}
				{/* <ToggleButton nameA={'My $FISH'} nameB={'Fight $FISH'} toggle={() => setShowOpponentSelection(!showOpponentSelection)} selectedOption={showOpponentSelection} /> */}
				{/* {fishSelectionToShow === FishSelectionEnum.MyFish &&
					<StakedStatus></StakedStatus>
				} */}
			</ContainerControls>
			{account && userFish.length > 0 && fishSelectionToShow === FishSelectionEnum.MyFish && 
				<FishViewer selectedFish={mySelectedFish} fishCollection={userFish} onClick={setUserFighter} />
			}
			{account && userFish.length === 0 && fishSelectionToShow === FishSelectionEnum.MyFish &&
				<BaseLinkButton to={'/catch'}>Catch a Fish!</BaseLinkButton>
			}
			{(fishSelectionToShow === FishSelectionEnum.FightFish || !account ) &&
				<FishViewer selectedOpponent={opponentFish} fishCollection={fightingFish} onClick={setOpponentFighter} />
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


export default FightingWaters;
