import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useWeb3React } from '@web3-react/core';
import { Fish } from '../utils/fish'
import { Fight} from '../utils/fight'
import { useUnity } from '../context/unityContext';
import { useFishPool } from '../context/fishPoolContext';
import { Error, BaseContainer, BaseText, ContainerColumn, ContainerControls } from './BaseStyles';
import ToggleButton, { ToggleGroup, ToggleItem, ToggleOption } from './ToggleButton';
import { useContractWrapper } from '../context/contractWrapperContext';
import { useFishFight } from '../context/fishFightContext';
import Account from './Account';
import FishDrawer from './FishDrawer';

enum FishView {
  MyFish,
  FightFish
}

const FightingWaters = () => {
	// State
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);
	const [opponentFish, setOpponentFish] = useState<Fish | null>(null);
	const [fishToShow, setFishToShow] = useState<number>(FishView.FightFish);
	const [fighter1Error, setFighter1Error] = useState<string | null>(null);
	const [fighter2Error, setFighter2Error] = useState<string | null>(null);
	// const [isFighting, setIsFighting] = useState<boolean>(false);
	const [renderedFish, setRenderedFish] = useState<number[]>([]);

	// Context
	const { userFish, fightingFish } = useFishPool()
	const { account } = useWeb3React();
	const unityContext = useUnity();
	const { fightFish, pendingTransaction, isFighting, updateIsFighting} = useContractWrapper();

	const FishViewOptions: ToggleItem[] = [
		{
			name: 'My $FISH',
			id: FishView.MyFish,
			onClick: () => setFishToShow(FishView.MyFish)
		},
		{
			name: 'Opponent $FISH',
			id: FishView.FightFish,
			onClick: () => setFishToShow(FishView.FightFish)
		}
	]

	useEffect(() => {
		unityContext.UnityInstance.on('UISelectionConfirm', async function (data: any) {
			// console.log('UI changed catch fish');
			// console.log(data)
			switch (data) {
				case 'confirm':
					const fight = await fightFish(mySelectedFish, opponentFish);
					console.log(fight)
					// if(fight) updateIsFighting(true);
					return;
				case 'fightresults_confirm':
					unityContext.clearUIFish();
					fightAgain()

					return;
				default:
					return;
			}

		});

		unityContext.UnityInstance.on("UI_Fighting_Start_Request", function () {
      // console.log("UI_Fighting_Start_Request!");
    });
	}, [unityContext.isFishPoolReady, account, mySelectedFish, opponentFish]);

	useEffect(() => {
		if(account) {
			setFishToShow(FishView.MyFish)
		} else {
			setFishToShow(FishView.FightFish)
		}
	}, [account]);

	useEffect(() => {
		// console.log("Show Fighting Location")
		// unityContext.clearFishPool("Fighting")
		// unityContext.clearFishPool("Breeding")
		// unityContext.clearFishPool('Fish');
		unityContext.clearUIFish();
		unityContext.hideUI();
		unityContext.showFightingLocation();
		unityContext.showFightingUI();
    updateIsFighting(false);
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		// console.log("Fighting Fish Changed")
		// console.log(fightingFish)
		if(!unityContext.isFishPoolReady) return;
		// unityContext.clearFishPool("ShowFighting")
		fightingFish.forEach(fish => {
			// unityContext.addFishFightingPool(fish);
		})
	}, [fightingFish, unityContext.isFishPoolReady]);


	const setUserFighter = async (fish : Fish) => {
		// console.log("User Selected Fish: " + fish.tokenId)
		// unityContext.showFightingUI();
		if(fish.fishModifiers.alphaModifier.uses > 0) {
			toast.error("Fighter Selection: Fish is Alpha");
			setFighter1Error(`Alpha can't start Fight`);
		}
		else if(fish.tokenId === opponentFish?.tokenId) {
			toast.error("Fighter Selection: Same Fish");
			setFighter1Error(`Same Fish`);
		}
		else if(fish.isUser && opponentFish?.isUser) {
			setFighter1Error(`Warning! About to Fight Owned Fish`);
		}
		else if(fish.stakedBreeding) {
			toast.error("Fighter Selection: Must Withdraw");
			setFighter1Error(`Must Withdraw from Breed Pool`);
		}
		else {
			setFighter1Error(null);
		}
		setMySelectedFish(fish);
		unityContext.addFishFight1(fish)
	}

	const setOpponentFighter = (fish : Fish) => {
		// console.log("Opponent Fish: " + fish.tokenId)
		// unityContext.showFightingUI();
		if(fish.tokenId == mySelectedFish?.tokenId) {
			toast.error("Fighter Selection: Same Fish");
			setFighter2Error(`Same Fish`);
		}
		else if(fish.isUser && mySelectedFish?.isUser) {
			setFighter2Error(`Warning! About to Fight Owned Fish`);
		}
		else {
			setFighter2Error(null);
		}
		setOpponentFish(fish);
		unityContext.addFishFight2(fish)
	}

	const selectAnother = () => {
		setMySelectedFish(null);
		// unityContext.showFightingLocation(); // switch to FightingWaters view
	}

	// useEffect(() => {
	// 	unityContext.UnityInstance.on('FishPoolFightWinner', function () {
	// 		console.log('Confirm FishPoolFightWinner');
	// 		setshowFightingLocationResult(true);
	// 	});
	// 	unityContext.UnityInstance.on('FishPoolFightTie', function () {
	// 		console.log('Confirm FishPoolFightTie');
	// 		setshowFightingLocationResult(true);
	// 	});
	// }, [unityContext.isFishPoolReady]);

	const fightAgain = () => {
		updateIsFighting(false)
		setMySelectedFish(null)
		setOpponentFish(null)
		setFighter1Error(null)
		setFighter2Error(null)
	}

	if(!unityContext.isFishPoolReady) return null;

	return(
		<BaseContainer>
			{!isFighting &&
			<>
				<OptionsContainer>
					{!account &&
						<Account textOverride={"Connect Wallet to Fight $FISH"}/>
					}
					{fighter1Error &&
						<ContainerColumn>
							<Error><BaseText>{fighter1Error}</BaseText></Error>
						</ContainerColumn>
					}
					{fighter2Error &&
						<ContainerColumn>
							<Error><BaseText>{fighter2Error}</BaseText></Error>
						</ContainerColumn>
					}
				</OptionsContainer>
				{fishToShow === FishView.MyFish &&
					<FishDrawer userFish type="Fighting" depositFighter selectedFish={mySelectedFish} fishCollection={userFish} onClick={setUserFighter}>
							<ToggleButton items={FishViewOptions} selected={fishToShow}></ToggleButton>
					</FishDrawer>
				}
				{fishToShow === FishView.FightFish &&
					<FishDrawer type="Fighting" depositFighter selectedOpponent={opponentFish} fishCollection={fightingFish} onClick={setOpponentFighter}>
						<ToggleButton items={FishViewOptions} selected={fishToShow}></ToggleButton>
					</FishDrawer>
				}
			</>

			}

		</BaseContainer>

	)
};

const OptionsContainer = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
`;



export default FightingWaters;
