import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { Fish } from '../utils/fish'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import web3 from 'web3';
import { BaseOverlayContainer, ContainerControls } from './BaseStyles';

const COSTPERCASTONE = web3.utils.toBN(1);

const CatchFish = () => {
	const unityContext = useUnity()
	const { account } = useWeb3React();
	const { FishFight, refetchBalance } = useFishFight()
	const { createUserFish } = useFishPool();
	const [caughtFish, setCaughtFish] = useState<Fish | null>(null);
	const [caughtFishHash, setCaughtFishHash] = useState<string | null>(null);
	const [noCatch, setNoCatch] = useState<boolean>(false);
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);
	const [diceRoll, setDiceRoll] = useState<number>(0);

	useEffect(() => {
		unityContext.showFishingLocation();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		console.log(account)
	}, [account]);

	useEffect(() => {
		unityContext.clearFishPool('Fishing');
		unityContext.clearFishPool('Breeding');
		unityContext.clearFishPool('Fighting');
		unityContext.showFishingUI();
	}, []);

	useEffect(() => {
		unityContext.UnityInstance.on('UISelectionConfirm', function (data: any) {
			console.log('UI changed catch fish');
			console.log(data)
			switch (data) {
				case 'mint_fish_2.5percent':
					catchFish();
					return;
				case 'mint_fish_5percent':
					catchFish();
					return;
				case 'mint_fish_10percent':
					catchFish();
					return;
				case 'mint_fish_100percent':
					catchFish();
					return;
				default:
					return;
			}
			
		});
	}, [unityContext.isFishPoolReady, account]);

	const getUserFish = async (tokenId: number) => {
		console.log(tokenId)
		const newFish = await createUserFish(tokenId)
		if(newFish != null) {
			console.log(newFish)
			setCaughtFish(newFish)
			unityContext.addFishFishing(newFish);
		}
	}


	const catchFish = async () => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		
		if(FishFight.type == 'web3') {
			const provider = FishFight.provider as web3;
			if(await provider.eth.getChainId() != 1666700000) {
				toast.error('Wrong Network');
				return;
			}
		}
		console.log("catch fish")
		setNoCatch(false);
		setCaughtFish(null);
		setCaughtFishHash(null);
		unityContext.clearFishPool('showFishingLocation');
		try {
			await FishFight.fishingWaters?.methods.goFishing().send({
				from: account,
				gasPrice: 30000000000,
				gasLimit: 500000,
				// gasLimit: await FishFight.fishingWaters?.methods.goFishing().estimateGas({from: account, value: web3.utils.toWei(COSTPERCASTONE)}),
				value: web3.utils.toWei(COSTPERCASTONE)
			}).on('transactionHash', () => {
				setPendingTransaction(true);
			}).on('receipt', (result: any) => {
				console.log(result)
				if(result.events.FishingResult.returnValues.index == 0) {
					console.log("set no catch")
					setNoCatch(true);
					setDiceRoll(result.events.FishingResult.returnValues.roll)
					setPendingTransaction(false);
					toast.success('Missed `Em!', {
						onClose: async () => {
							refetchBalance()
						},
					});
					return;
				}

				setCaughtFishHash(result.transactionHash)
				getUserFish(result.events.FishingResult.returnValues.index);
				setPendingTransaction(false);
				toast.success('Fish Caught!', {
					onClose: async () => {
						refetchBalance()
					},
				});
			})
		} catch (error: any) {
			toast.error(error);
			console.log(error)
		}
	};

	return (
		<BaseOverlayContainer
			active={pendingTransaction}
			spinner
			text='Fishing from the blockchain...'>
		{caughtFish && caughtFishHash &&
			<ContainerControls>
				<CaughtFish>
					<FishData><b>Token ID: {caughtFish.tokenId}</b></FishData>
					<FishData>Strength: {caughtFish.strength}</FishData>
					<FishData>Intelligence: {caughtFish.intelligence}</FishData>
					<FishData>Agiltiy: {caughtFish.agility}</FishData>
					<FishData>Rarity: {caughtFish.rarity}</FishData>
					<TransactionLink target="_blank" href={`https://explorer.pops.one/tx/${caughtFishHash}`}>View Transaction</TransactionLink>
				</CaughtFish>

				<GameButton onClick={() => {
					setCaughtFish(null);
					setCaughtFishHash(null);
					unityContext.clearFishPool('showFishingLocation');
				}}>
					Catch another fish!
				</GameButton>
			</ContainerControls>
		}
		
		{noCatch &&
		<ContainerControls>
			<MissedCatchContainer>
				<CaughtFish>
					<Text>Sorry... It got away!</Text>
					<Text>You rolled a {diceRoll}</Text>
				</CaughtFish>

				<GameButton onClick={() => {
					setCaughtFish(null);
					setCaughtFishHash(null);
					setNoCatch(false)
					unityContext.clearFishPool('showFishingLocation');
				}}>
					Try again!
				</GameButton>
			</MissedCatchContainer>
		</ContainerControls>
		}
		
		</BaseOverlayContainer>
	);
};

const CaughtFish = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: white;
	padding: ${props => props.theme.spacing.gap};
	margin: ${props => props.theme.spacing.gap};
	border-radius: 25px;
`;

const TransactionLink = styled.a`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const FishData = styled.p`
	display: flex;
	flex-flow: column;
	align-items: center;
	justify-content: center;
	color: ${"black"};
	text-align: center;
	font-size: ${props => props.theme.font.medium};
	background-color: rgba(255, 255, 255, 0.7);
	margin: 0 ${props => props.theme.spacing.gapSmall};
	padding: ${props => props.theme.spacing.gapSmall};
	border-radius: 50%;
	height: ${props => props.theme.font.small}vmin;
`;

const MissedCatchContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100%;
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

const GameButton = styled.button`
	text-align: center;
	padding: ${props => props.theme.spacing.gap};
	border-radius: 25px;
	background-color: white;
	opacity: 0.7;
	border: none;
	box-shadow: 1px 2px 4px 4px rgba(0, 0, 0, 0.25);
	color: black;
	margin-left: ${props => props.theme.spacing.gapSmall};
	transition: opacity 0.3s ease, box-shadow 0.25s ease-in-out;
	text-transform: uppercase;
	font-weight: bolder;
	text-decoration: none;
	font-size: ${props => props.theme.font.large};

	&:hover {
		opacity: 1;
		box-shadow: 1px 2px 2px 2px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
`;

export default CatchFish;
