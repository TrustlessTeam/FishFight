import { useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useWeb3React } from "@web3-react/core";
import { Fish } from "../utils/fish";
import { useUnity } from "../context/unityContext";
import { PoolFish, PoolTypes, useFishPool } from "../context/fishPoolContext";
import { Error, BaseContainer, BaseText, ContainerColumn } from "./BaseStyles";
import ToggleButton, { ToggleItem } from "./ToggleButton";
import { useContractWrapper } from "../context/contractWrapperContext";
import { useFishFight } from "../context/fishFightContext";
import BuffModal from "./BuffModal";
import Countdown, { zeroPad } from "react-countdown";
import FishDrawer from "./FishDrawer";
import web3 from "web3";

import { NavLink } from "react-router-dom";
import { Constants } from "../utils/constants";

enum FishView {
	MyFish,
	FightFish,
}

type RenderProps = {
	hours: any;
	minutes: any;
	seconds: any;
	completed: boolean;
};

const FightingWatersWeak = () => {
	// State
	const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);
	const [opponentFish, setOpponentFish] = useState<Fish | null>(null);
	const [fishToShow, setFishToShow] = useState<number>(FishView.FightFish);
	const [fighter1Error, setFighter1Error] = useState<string | null>(null);
	const [fighter2Error, setFighter2Error] = useState<string | null>(null);
	// const [isFighting, setIsFighting] = useState<boolean>(false);
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [renderedFish, setRenderedFish] = useState<number[]>([]);

	// Context
	const { userFish, fightingFishWeak, loadingFish, loadingUserFish } =
		useFishPool();
	const { maxSupply, totalSupply, currentPhase, fightingWatersWeakSupply } =
		useFishFight();
	const { account } = useWeb3React();
	const unityContext = useUnity();
	const { fightFishWeak, pendingTransaction, isFighting, updateIsFighting } =
		useContractWrapper();
	const toggleModal = () => {
		setModalIsOpen(!modalIsOpen);
	};
	const FishViewOptions: ToggleItem[] = [
		{
			name: "My $FISH",
			id: FishView.MyFish,
			onClick: () => setFishToShow(FishView.MyFish),
		},
		{
			name: "Opponent $FISH",
			id: FishView.FightFish,
			onClick: () => setFishToShow(FishView.FightFish),
		},
	];

	useEffect(() => {
		unityContext.UnityInstance.on(
			"UISelectionConfirm",
			async function (data: any) {
				// console.log('UI changed catch fish');
				// console.log(data)
				switch (data) {
					case "confirm":
						const fight = await fightFishWeak(mySelectedFish, opponentFish);
						// console.log(fight)
						// if(fight) updateIsFighting(true);
						return;
					case "fightresults_confirm":
						unityContext.clearUIFish();
						fightAgain();

						return;
					default:
						return;
				}
			}
		);

		unityContext.UnityInstance.on("UI_Fighting_Start_Request", function () {
			// console.log("UI_Fighting_Start_Request!");
		});
	}, [unityContext.isFishPoolReady, account, mySelectedFish, opponentFish]);

	useEffect(() => {
		if (account) {
			setFishToShow(FishView.MyFish);
		} else {
			setFishToShow(FishView.FightFish);
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
		if (!unityContext.isFishPoolReady) return;
		// unityContext.clearFishPool("ShowFighting")
		fightingFishWeak.forEach((fish) => {
			// unityContext.addFishFightingPool(fish);
		});
	}, [fightingFishWeak, unityContext.isFishPoolReady]);

	const setUserFighter = async (fish: Fish) => {
		// console.log("User Selected Fish: " + fish.tokenId)
		// unityContext.showFightingUI();
		if (fish.fishModifiers.alphaModifier.uses > 0) {
			toast.error("Fighter Selection: Fish is Alpha");
			setFighter1Error(`Alpha can't start Fight`);
		} else if (
			fish.strength > 50 ||
			fish.intelligence > 50 ||
			fish.agility > 50
		) {
			toast.error("Fighter Selection: Stats must be <= 50");
			setFighter1Error(`Fish too strong!`);
		} else if (fish.tokenId === opponentFish?.tokenId) {
			toast.error("Fighter Selection: Same Fish");
			setFighter1Error(`Same Fish`);
		} else if (fish.isUser && opponentFish?.isUser) {
			setFighter1Error(`Warning! About to Fight Owned Fish`);
		} else if (fish.stakedBreeding) {
			toast.error("Fighter Selection: Must Withdraw");
			setFighter1Error(`Must Withdraw from Breed Pool`);
		} else {
			setFighter1Error(null);
		}
		setMySelectedFish(fish);
		unityContext.addFishFight1(fish);
	};

	const setOpponentFighter = (fish: Fish) => {
		// console.log("Opponent Fish: " + fish.tokenId)
		// unityContext.showFightingUI();
		if (fish.tokenId == mySelectedFish?.tokenId) {
			toast.error("Fighter Selection: Same Fish");
			setFighter2Error(`Same Fish`);
		} else if (fish.isUser && mySelectedFish?.isUser) {
			setFighter2Error(`Warning! About to Fight Owned Fish`);
		} else {
			setFighter2Error(null);
		}
		setOpponentFish(fish);
		unityContext.addFishFight2(fish);
	};

	const selectAnother = () => {
		setMySelectedFish(null);
		// unityContext.showFightingLocation(); // switch to FightingWaters view
	};

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
		updateIsFighting(false);
		setMySelectedFish(null);
		setOpponentFish(null);
		setFighter1Error(null);
		setFighter2Error(null);
	};

	const renderer = ({ hours, minutes, seconds, completed }: RenderProps) => {
		// Render a countdown
		return (
			<span>
				{hours}:{zeroPad(minutes)}:{zeroPad(seconds)}
			</span>
		);
	};

	let timeTilPhase =
		currentPhase?.phase === 3
			? currentPhase.phaseEndtime + Constants._fishPhaseLength
			: currentPhase?.phaseEndtime;

	return (
		<BaseContainer>
			{mySelectedFish != null && (
				<BuffModal
					fish={mySelectedFish}
					modalIsOpen={modalIsOpen}
					toggleModal={toggleModal}
				/>
			)}
			<InfoContainer>
				<NavContainer>
					<NavItem
						className={({ isActive }) => (isActive ? "active" : "")}
						to="/fighting"
						end
					>
						FREE FOR ALL
					</NavItem>
					<NavItem
						className={({ isActive }) => (isActive ? "active" : "")}
						to="/fighting/weak"
					>{`STATS UNDER 50`}</NavItem>
					{/* <Option className={({isActive}) => isActive ? 'active' : ''} to='/fighting/start'>FIGHT!</Option> */}
				</NavContainer>

				<DataContainer>
					{!loadingFish && !loadingUserFish && (
						<>
							{currentPhase?.phase === 2 ? (
								<DataText>
									{`$FISHFOOD per Win: ${web3.utils.fromWei(
										Constants._fishFoodPerWinInPhaseWeak
									)} ->`}
									<StyledCountdown>
										<Countdown
											renderer={renderer}
											date={new Date(currentPhase.phaseEndtime * 1000)}
										/>
									</StyledCountdown>
									{`then ${web3.utils.fromWei(Constants._fishFoodPerWinWeak)}`}
								</DataText>
							) : (
								<DataText>
									{`$FISHFOOD per Win: ${web3.utils.fromWei(
										Constants._fishFoodPerWinWeak
									)} ->`}
									<StyledCountdown>
										<Countdown
											renderer={renderer}
											date={new Date(timeTilPhase ? timeTilPhase * 1000 : 0)}
										/>
									</StyledCountdown>
									{`then ${web3.utils.fromWei(
										Constants._fishFoodPerWinInPhaseWeak
									)}`}
								</DataText>
							)}
						</>
					)}

					<DataText>
						{`DEPOSIT REWARD $FISHFOOD per Hour: ~${web3.utils.fromWei(
							Constants._fishFoodPerBlockWeakBN
								.mul(1800)
								.div(fightingWatersWeakSupply + 1)
								.toString()
						)}`}
					</DataText>
				</DataContainer>
			</InfoContainer>
			{!isFighting && (
				<>
					<OptionsContainer>
						{fighter1Error && (
							<ContainerColumn>
								<Error>
									<BaseText>{fighter1Error}</BaseText>
								</Error>
							</ContainerColumn>
						)}
						{fighter2Error && (
							<ContainerColumn>
								<Error>
									<BaseText>{fighter2Error}</BaseText>
								</Error>
							</ContainerColumn>
						)}
					</OptionsContainer>
					{fishToShow === FishView.MyFish && (
						<FishDrawer
							buffModal={toggleModal}
							fishPool={PoolFish.User}
							poolType={PoolTypes.FightingWeak}
							type="Fighting"
							depositFighter
							selectedFish={mySelectedFish}
							fishCollection={userFish}
							onClick={setUserFighter}
						>
							<ToggleButton
								items={FishViewOptions}
								selected={fishToShow}
							></ToggleButton>
						</FishDrawer>
					)}
					{fishToShow === FishView.FightFish && (
						<FishDrawer
							fishPool={PoolFish.FightingWeak}
							poolType={PoolTypes.FightingWeak}
							type="Fighting"
							depositFighter
							selectedOpponent={opponentFish}
							fishCollection={fightingFishWeak}
							onClick={setOpponentFighter}
						>
							<ToggleButton
								items={FishViewOptions}
								selected={fishToShow}
							></ToggleButton>
						</FishDrawer>
					)}
				</>
			)}
		</BaseContainer>
	);
};

interface ActiveProps {
	active?: boolean;
}

const NavContainer = styled.div`
  display: flex;
  padding-bottom: ${(props) => props.theme.spacing.gap};
`;

const NavItem = styled(NavLink) <ActiveProps>`
  /* height: 35px; */
  /* border: 2px solid white;s */
  border-radius: 10px;
  padding: ${(props) => props.theme.spacing.gap};
  margin: 0 ${(props) => props.theme.spacing.gapSmall};
  background-image: linear-gradient(#d5d5d5, #d5d5d5);
  box-shadow: inset 2px 2px 2px #c7c7c74b, inset -2px -2px 2px #3f3f3f4c;
  text-decoration: none;
  color: black;
  font-size: ${(props) => props.theme.font.small};
  cursor: pointer;
  pointer-events: auto;

  @media ${(props) => props.theme.device.tablet} {
    font-size: ${(props) => props.theme.font.medium};
  }

  &.active {
    font-weight: bold;
    background-image: linear-gradient(#d5d5d5, #038ec59b);
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`;

const StyledCountdown = styled.span`
  padding: 0 3px;
`;

const DataContainer = styled.div`
  display: flex;
  flex-flow: column;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: ${(props) => props.theme.spacing.gap};
`;

const InfoContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  /* height: 100%; */
  width: 100%;
  margin-top: 60px;
  top: 0;
  pointer-events: none;

  @media ${(props) => props.theme.device.tablet} {
    margin-top: 100px;
  }
`;

const DataText = styled.p`
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  color: black;
  border-radius: 20px;
  margin: 0;
  font-size: ${(props) => props.theme.font.small};

  padding-bottom: ${(props) => props.theme.spacing.gapSmall};

  &:last-child {
    padding-bottom: 0;
  }

  & > span {
    margin-left: 4px;
  }

  @media ${(props) => props.theme.device.tablet} {
    margin: 0;
    font-size: ${(props) => props.theme.font.medium};
  }
`;

export default FightingWatersWeak;
