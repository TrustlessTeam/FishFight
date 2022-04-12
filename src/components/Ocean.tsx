import { useState, useEffect } from 'react';

import { PoolFish, useFishPool } from '../context/fishPoolContext';
import { useUnity } from '../context/unityContext';
import { useWeb3React } from '@web3-react/core';

import Account from './Account';
import BaseButton from "../components/BaseButton";
import { ContainerControls, BaseLinkButton, BaseContainer, OptionsContainer, StyledModal, BaseTitle, ContainerColumn, ContainerRow, BaseText } from './BaseStyles';
import ToggleButton, { ToggleItem } from './ToggleButton';
import Fish from '../utils/fish';
import { useContractWrapper } from '../context/contractWrapperContext';
import { useFishFight } from '../context/fishFightContext';
import FishDrawer from './FishDrawer';
import { Constants } from '../utils/constants';

enum FishView {
	Ocean,
	User
}

let renderedOceanFish: number[] = [];

const Ocean = () => {
	const { userFish, oceanFish } = useFishPool();
	const [fishToShow, setFishToShow] = useState<number>(FishView.Ocean);
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);
	const [modalIsOpen, setModalIsOpen] = useState(false);


	// const [renderedFish, setRenderedFish] = useState<number[]>([]);
	const unityContext = useUnity();
	const { feedFish, claimFishFood, questFish, depositBreedingFish, depositFightingFish, smartWithdraw, withdrawBreedingFish, pendingTransaction } = useContractWrapper();
	const { account } = useWeb3React();


	const FishViewOptions: ToggleItem[] = [
		{
			name: 'Ocean Fish',
			id: FishView.Ocean,
			onClick: () => setFishToShow(FishView.Ocean)
		},
		{
			name: 'My Fish',
			id: FishView.User,
			onClick: () => setFishToShow(FishView.User)
		}
	]

	useEffect(() => {
		unityContext.UnityInstance.on('UISelectionConfirm', function (data: any) {
			console.log(data)
			switch (data) {
        case "feed_confirm":
          feedFish(mySelectedFish);
          return;
        case "collect_confirm":
					claimFishFood(mySelectedFish);
          return;
        case "quest_confirm":
          toggleModel()
          return;
				case "deposit_fight_confirm":
					depositFightingFish(mySelectedFish);
					return;
				case "withdraw_fight_confirm":
					smartWithdraw(mySelectedFish);
					return;
				case "deposit_breed_confirm":
					depositBreedingFish(mySelectedFish);
					return;
				case "withdraw_breed_confirm":
					withdrawBreedingFish(mySelectedFish);
					return;
        default:
          return;
      }
		});
	}, [unityContext.isFishPoolReady, mySelectedFish, account]);

	useEffect(() => {
		console.log("CLEAR OCEAN")
		// unityContext.showFishUI();
		unityContext.clearUIFish();
		// unityContext.hideUI();
		unityContext.showOceanLocation();
	}, [unityContext.isFishPoolReady]);

	useEffect(() => {
		if(!unityContext.isFishPoolReady) return;

		oceanFish.forEach(poolFish => {
			if(!renderedOceanFish.some(tokenId => poolFish.tokenId === tokenId)) {
				unityContext.addFishOcean(poolFish);
				// if(renderedOceanFish.length > Constants._MAXFISH) renderedOceanFish.shift()
				renderedOceanFish.push(poolFish.tokenId)
			}
		})
	}, [unityContext.isFishPoolReady, oceanFish]);

	useEffect(() => {
		if(!unityContext.isFishPoolReady) return;

		userFish.forEach(poolFish => {
			if(!renderedOceanFish.some(tokenId => poolFish.tokenId === tokenId)) {
				unityContext.addFishOcean(poolFish);
				// if(renderedOceanFish.length > Constants._MAXFISH) renderedOceanFish.shift()
				renderedOceanFish.push(poolFish.tokenId)
			}
		})
	}, [unityContext.isFishPoolReady, userFish]);

	

	// useEffect(() => {
	// 	console.log("CLEAR OCEAN")
	// 	unityContext.clearFishPool('showOceanLocation')
	// 	unityContext.showOceanLocation();
	// }, []);

	useEffect(() => {
		console.log("Account changed")
		if(account) {
			setFishToShow(FishView.User)
		} else {
			setFishToShow(FishView.Ocean)
		}
	}, [account]);

	const oceanFishClick = (fish: Fish) => {
		setMySelectedFish(fish);
		unityContext.showFish(fish)
	}

	const toggleModel = () => {
		setModalIsOpen(!modalIsOpen);
	};

	const closeModal = () => {
		setModalIsOpen(false);
	};

	// useEffect(() => {
	// 	console.log("Ocean Fish Changed")
	// 	// console.log(oceanFish)
	// 	if(!unityContext.isFishPoolReady) return;
	// 	let i = 0;
	// 	oceanFish.forEach(fish => {
	// 		if(!renderedFish.includes(fish.tokenId)) {
	// 			unityContext.addFishOcean(fish);
	// 			setRenderedFish(prevData => [...prevData, fish.tokenId])
	// 			i++;
	// 		}
	// 	})
	// 	console.log(i)
	// }, [oceanFish, unityContext.isFishPoolReady]);

	// useEffect(() => {
	// 	unityContext.showOceanLocation();
	// }, [unityContext.isFishPoolReady]);

	return (

		<BaseContainer>	
			{mySelectedFish != null && mySelectedFish.canQuest &&
				<StyledModal
				isOpen={modalIsOpen}
				// className="Modal"
				overlayClassName="Overlay"
				onRequestClose={closeModal}
				shouldCloseOnOverlayClick
			>
				{/* {active ? <SignOut account={parsedAccount} closeModal={closeModal} /> : <Wallets closeModal={closeModal} />} */}
				<ContainerColumn>
					<BaseTitle>{`Drain ${Constants._fightModifierCost} Power to Buff an attribute of your $FISH for 3 Fights!`}</BaseTitle>
					<ContainerRow>
						<ContainerColumn>
							<BaseText>{`Strength ${mySelectedFish.strength} -> ${mySelectedFish.strength+Constants._fightModifierValue > 100 ? 100 : mySelectedFish.strength+Constants._fightModifierValue}`}</BaseText>
							<BaseButton onClick={() => {questFish(mySelectedFish, 0); closeModal()}}>Buff Strength</BaseButton>
						</ContainerColumn>
						<ContainerColumn>
							<BaseText>{`Intelligence ${mySelectedFish.intelligence} -> ${mySelectedFish.intelligence+Constants._fightModifierValue > 100 ? 100 : mySelectedFish.intelligence+Constants._fightModifierValue}`}</BaseText>
							<BaseButton onClick={() => {questFish(mySelectedFish, Constants.MODIFIER_INT); closeModal()}}>Buff Intelligence</BaseButton>
						</ContainerColumn>
						<ContainerColumn>
							<BaseText>{`Strength ${mySelectedFish.agility} -> ${mySelectedFish.agility+Constants._fightModifierValue > 100 ? 100 : mySelectedFish.agility+Constants._fightModifierValue}`}</BaseText>
							<BaseButton onClick={() => {questFish(mySelectedFish, Constants.MODIFIER_AGI); closeModal()}}>Buff Agility</BaseButton>
						</ContainerColumn>          
					</ContainerRow>
				</ContainerColumn>
				
			</StyledModal>
			}
				
				{/* <FishDrawer fishCollection={oceanFish}></FishDrawer> */}
				{fishToShow === FishView.Ocean &&
					<FishDrawer fishPool={PoolFish.Ocean} selectedOpponent={mySelectedFish} fishCollection={oceanFish} onClick={oceanFishClick}>
						<ToggleButton items={FishViewOptions} selected={fishToShow}></ToggleButton>
					</FishDrawer>
				}
				{fishToShow === FishView.User &&
					<FishDrawer fishPool={PoolFish.User} selectedFish={mySelectedFish} fishCollection={userFish} onClick={oceanFishClick}>
						<>
							<ToggleButton items={FishViewOptions} selected={fishToShow}></ToggleButton>
							{!account &&
								<Account />
							}
							{account && userFish?.length === 0 &&
								<BaseLinkButton to={'/fishing'}>Catch a Fish!</BaseLinkButton>
							}
						</>
					</FishDrawer>
				}
				
		</BaseContainer>
		
	);
};

export default Ocean;
