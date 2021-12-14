import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import BN from 'bn.js';
import { Fish } from '../utils/fish'
import { Fight} from '../utils/fight'
import { useFishFight } from '../context/fishFightContext';
import { useUnity } from '../context/unityContext';
import { hexToNumber, Unit } from '@harmony-js/utils';
import FishNFT from './FishNFT';
import { useFishPool } from '../context/fishPoolContext';
import { BaseContainer, ContainerControls,  BaseButton, BaseOverlayContainer } from './BaseStyles';
import FishViewer from './FishViewer';
import Menu, { MenuItem } from './Menu';
import web3 from 'web3';

enum FishSelectionEnum {
  UserBreedingFish,
  UserFish
}

enum BreedingSelectionEnum {
  MyFishToBreed,
	FishToBreedWith
}

const StartBreed = () => {
	const { FishFight, refetchBalance } = useFishFight()
	const { userFish, breedingFish, userBreedingFish, refreshFish, createUserFish } = useFishPool()

	// Fish selected for fight
	const [myBettaFish, setMyBettaFish] = useState<Fish | null>(null);
	const [alphaFish, setAlphaFish] = useState<Fish | null>(null);
	const [breederSelectionToShow, setBreederSelectionToShow] = useState<number>(BreedingSelectionEnum.MyFishToBreed);
	const [fishSelectionToShow, setFishSelectionToShow] = useState<number>(FishSelectionEnum.UserBreedingFish);
	const [breedResult, setBreedResult] = useState<Fish | null>();
	const [showBreedResult, setShowBreedResult] = useState(false);
	const [isBreeding, setIsBreeding] = useState<boolean>(false);
	const [pendingTransaction, setPendingTransaction] = useState<boolean>(false);


	// Context
	const { account } = useWeb3React();
	const unityContext = useUnity();

	const FishViewOptions: MenuItem[] = [
		{
			name: 'My Fighting Fish',
			onClick: () => setFishSelectionToShow(FishSelectionEnum.UserBreedingFish)
		},
		{
			name: 'My Fish',
			onClick: () => setFishSelectionToShow(FishSelectionEnum.UserFish)
		}
	]

	const BreederSelectionOptions: MenuItem[] = [
		{
			name: 'Select Fighter',
			onClick: () => setBreederSelectionToShow(BreedingSelectionEnum.MyFishToBreed)
		},
		{
			name: 'Select Opponent',
			onClick: () => setBreederSelectionToShow(BreedingSelectionEnum.FishToBreedWith)
		}
	]

	useEffect(() => {
		unityContext.showFight();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		unityContext.UnityInstance.on('FishPoolFightWinner', function () {
			console.log('Confirm FishPoolFightWinner');
			setShowBreedResult(true);
		});
		unityContext.UnityInstance.on('FishPoolFightTie', function () {
			console.log('Confirm FishPoolFightTie');
			setShowBreedResult(true);
		});
	}, [unityContext.isFishPoolReady]);

	const setAlpha = (fish : Fish) => {
		console.log("Alpha Fish: " + fish.tokenId)
		//unityContext.clearFishPool('ShowFight');
		if(myBettaFish != null) {
			unityContext.addFishFight2(myBettaFish);
		}
		setAlphaFish(fish);
		unityContext.addFishFight2(fish)
	}

	const setUserFish = async (fish : Fish) => {
		console.log("UserSelected Fish: " + fish.tokenId)
		//unityContext.clearFishPool('ShowFight');
		if(alphaFish != null) {
			unityContext.addFishFight1(alphaFish);
		}
		setMyBettaFish(fish);
		unityContext.addFishFight1(fish)
	}

	const breedFish = async () => {
		if(!account) {
			toast.error('Connect your wallet');
			return;
		}
		if(myBettaFish == null) {
			toast.error('Select Your Fish to Breed');
			return;
		}
		if(alphaFish == null) {
			toast.error('Select Fish to Breed with');
			return;
		}

		try {
			if(FishFight.type === 'web3') {
				const web3WalletProvider = FishFight.providerWallet as web3;
				const approveAndBreed = new web3WalletProvider.BatchRequest();
				approveAndBreed.add(
					FishFight.fishFood?.methods.approve(FishFight.readBreedingWaters.options.address, new Unit(100).asOne().toWei()).send({
						from: account,
						gasPrice: 1000000000,
						gasLimit: 300000,
					})
				);
				approveAndBreed.add(
					FishFight.breedingWaters?.methods.breedFish(alphaFish.tokenId, myBettaFish.tokenId).send({
						from: account,
						gasPrice: 1000000000,
						gasLimit: 1200000,
						value: new Unit(50).asOne().toWei()
					}).on('transactionHash', () => {
						setPendingTransaction(true);
					}).on('receipt', async (data: any) => {
						console.log(data)
						setPendingTransaction(false);
						setFishSelectionToShow(FishSelectionEnum.UserFish)
						const fish = await createUserFish(web3.utils.toNumber(data.events.BreedingResult.returnValues.tokenId));
						if(fish != null) {
							unityContext.showFish(fish);
						}
						setIsBreeding(false);
					})
				);
				console.log("Batch call execute")
				approveAndBreed.execute();
			} else {
				const approve = await FishFight.fishFood?.methods.approve(FishFight.readBreedingWaters.options.address, new Unit(100).asOne().toWei()).send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 300000,
				})
				console.log(approve)
				FishFight.breedingWaters?.methods.breedFish(alphaFish.tokenId, myBettaFish.tokenId).send({
					from: account,
					gasPrice: 1000000000,
					gasLimit: 1200000,
					value: new Unit(50).asOne().toWei()
				}).on('transactionHash', () => {
					setPendingTransaction(true);
				}).on('receipt', async (data: any) => {
					console.log(data)
					setPendingTransaction(false);
					setFishSelectionToShow(FishSelectionEnum.UserFish)
					const fish = await createUserFish(web3.utils.toNumber(data.events.BreedingResult.returnValues.tokenId));
					if(fish != null) {
						unityContext.showFish(fish);
					}
					setIsBreeding(false);
				})
			}
			toast.success('Transaction done', {
				onClose: async () => {
					refetchBalance()
					// refetchFightingFish()
				},
			});
		} catch (error: any) {
			console.log(error)
			toast.error(error);
			setIsBreeding(false)
			setMyBettaFish(null)
			setAlphaFish(null)
		}
	};

	const fightAgain = () => {
		setBreedResult(null)
		setIsBreeding(false)
		setMyBettaFish(null)
		setAlphaFish(null)
		setShowBreedResult(false);		
	}

	return (
		<>
		{/* Select Fish to Fight */}
		{!breedResult && !isBreeding &&
			<BaseOverlayContainer>
				{
					<FightGrid>
						{myBettaFish &&
							<FishNFT selectedUser={true} fish={myBettaFish}></FishNFT>
						}
						<VersusContainer>
							<Text>with</Text>
							{myBettaFish != null && alphaFish != null ?
								<BaseButton onClick={() => breedFish()}>
									Breed Fish
								</BaseButton>
								:
								<Text>Select Fish to Breed</Text>
							}
						</VersusContainer>
						{alphaFish &&
							<FishNFT selectedOpponent={true} fish={alphaFish}></FishNFT>
						}
					</FightGrid>
				}
				<ContainerControls>
					<Menu name={BreedingSelectionEnum[breederSelectionToShow]} items={BreederSelectionOptions}></Menu>
					{breederSelectionToShow === BreedingSelectionEnum.MyFishToBreed &&
						<Menu name={FishSelectionEnum[fishSelectionToShow]} items={FishViewOptions}></Menu>
					}
				</ContainerControls>
				{breederSelectionToShow === BreedingSelectionEnum.MyFishToBreed &&
					<FishViewer selectedFish={myBettaFish} fishCollection={fishSelectionToShow === FishSelectionEnum.UserBreedingFish ? userBreedingFish : userFish} onClick={setUserFish}></FishViewer>
				}
				{breederSelectionToShow === BreedingSelectionEnum.FishToBreedWith &&
					<FishViewer selectedOpponent={alphaFish} fishCollection={breedingFish} onClick={setAlpha}></FishViewer>
				}
			</BaseOverlayContainer>
		}

		{/* Fish are Fighting */}
		{isBreeding && myBettaFish && alphaFish &&
			<BaseOverlayContainer>
				<FightGrid >
					<FishNFT selectedUser={true} fish={myBettaFish}></FishNFT>
					<VersusContainer>
						<Text>with</Text>
						<Text>Awaiting results from blockchain...</Text>
					</VersusContainer>
					<FishNFT selectedOpponent={true} fish={alphaFish}></FishNFT>
				</FightGrid>
			</BaseOverlayContainer>
		}

		{/* Show Fight Results */}
		{breedResult && myBettaFish && alphaFish &&
			<BaseOverlayContainer>
				<ContainerControls>
					<BaseButton onClick={() => fightAgain()}>
						Fight Another Fish!
					</BaseButton>
				</ContainerControls>
				<FightGrid>
					<FishNFT selectedUser={true} fish={myBettaFish}></FishNFT>
					{showBreedResult ? 
					<ResultContainer>
						<ResultData>New Fish</ResultData>
					</ResultContainer>
					:
					<VersusContainer><Text>Fight Starting!</Text></VersusContainer>
					}
					
					<FishNFT selectedOpponent={true} fish={alphaFish}></FishNFT>
				</FightGrid>
			</BaseOverlayContainer>
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
	font-size: ${props => props.theme.font.large}vmin;
	border-radius: 25px;
	margin-left: ${props => props.theme.spacing.gapSmall};
`;

const ResultData = styled.p`
	color: ${"black"};
	font-size: ${props => props.theme.font.medium}vmin;
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



export default StartBreed;
