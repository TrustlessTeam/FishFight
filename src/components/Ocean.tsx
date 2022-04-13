import { useState, useEffect } from "react";

import { PoolFish, PoolTypes, useFishPool } from "../context/fishPoolContext";
import { useUnity } from "../context/unityContext";
import { useWeb3React } from "@web3-react/core";

import Account from "./Account";
import BaseButton from "../components/BaseButton";
import {
  ContainerControls,
  BaseLinkButton,
  BaseContainer,
  OptionsContainer,
  StyledModal,
  BaseTitle,
  ContainerColumn,
  ContainerRow,
  BaseText,
} from "./BaseStyles";
import ToggleButton, { ToggleItem } from "./ToggleButton";
import Fish from "../utils/fish";
import { useContractWrapper } from "../context/contractWrapperContext";
import { useFishFight } from "../context/fishFightContext";
import FishDrawer from "./FishDrawer";
import { Constants } from "../utils/constants";
import BuffModal from "./BuffModal";
import DepositModal from "./DepositModal";

enum FishView {
  Ocean,
  User,
}

let renderedOceanFish: number[] = [];

const Ocean = () => {
  const { userFish, oceanFish } = useFishPool();
  const [fishToShow, setFishToShow] = useState<number>(FishView.Ocean);
  const [mySelectedFish, setMySelectedFish] = useState<Fish | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpenDeposit, setModalIsOpenDeposit] = useState(false);

  // const [renderedFish, setRenderedFish] = useState<number[]>([]);
  const unityContext = useUnity();
  const {
    feedFish,
    claimFishFood,
    questFish,
    depositBreedingFish,
    depositFightingFish,
    smartWithdraw,
    withdrawBreedingFish,
    pendingTransaction,
  } = useContractWrapper();
  const { account } = useWeb3React();

  const FishViewOptions: ToggleItem[] = [
    {
      name: "Ocean Fish",
      id: FishView.Ocean,
      onClick: () => setFishToShow(FishView.Ocean),
    },
    {
      name: "My Fish",
      id: FishView.User,
      onClick: () => setFishToShow(FishView.User),
    },
  ];

  useEffect(() => {
    unityContext.UnityInstance.on("UISelectionConfirm", function (data: any) {
      console.log(data);
      switch (data) {
        case "feed_confirm":
          feedFish(mySelectedFish);
          return;
        case "collect_confirm":
          claimFishFood(mySelectedFish);
          return;
        case "quest_confirm":
          toggleModal();
          return;
        case "deposit_fight_confirm":
          // depositFightingFish(mySelectedFish);
          toggleModalDeposit();
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
    console.log("CLEAR OCEAN");
    // unityContext.showFishUI();
    unityContext.clearUIFish();
    // unityContext.hideUI();
    unityContext.showOceanLocation();
  }, [unityContext.isFishPoolReady]);

  useEffect(() => {
    if (!unityContext.isFishPoolReady) return;

    oceanFish.forEach((poolFish) => {
      if (!renderedOceanFish.some((tokenId) => poolFish.tokenId === tokenId)) {
        unityContext.addFishOcean(poolFish);
        // if(renderedOceanFish.length > Constants._MAXFISH) renderedOceanFish.shift()
        renderedOceanFish.push(poolFish.tokenId);
      }
    });
  }, [unityContext.isFishPoolReady, oceanFish]);

  useEffect(() => {
    if (!unityContext.isFishPoolReady) return;

    userFish.forEach((poolFish) => {
      if (!renderedOceanFish.some((tokenId) => poolFish.tokenId === tokenId)) {
        unityContext.addFishOcean(poolFish);
        // if(renderedOceanFish.length > Constants._MAXFISH) renderedOceanFish.shift()
        renderedOceanFish.push(poolFish.tokenId);
      }
    });
  }, [unityContext.isFishPoolReady, userFish]);

  // useEffect(() => {
  // 	console.log("CLEAR OCEAN")
  // 	unityContext.clearFishPool('showOceanLocation')
  // 	unityContext.showOceanLocation();
  // }, []);

  useEffect(() => {
    console.log("Account changed");
    if (account) {
      setFishToShow(FishView.User);
    } else {
      setFishToShow(FishView.Ocean);
    }
  }, [account]);

  const oceanFishClick = (fish: Fish) => {
    setMySelectedFish(fish);
    unityContext.showFish(fish);
  };

  const toggleModal = () => {
    setModalIsOpen(!modalIsOpen);
  };

	const toggleModalDeposit = () => {
    setModalIsOpenDeposit(!modalIsOpenDeposit);
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
      {mySelectedFish != null && (
        <BuffModal
          fish={mySelectedFish}
          modalIsOpen={modalIsOpen}
          toggleModal={toggleModal}
        />
      )}

			{mySelectedFish != null && (
				<DepositModal
					fish={mySelectedFish}
					modalIsOpen={modalIsOpenDeposit}
					toggleModal={toggleModalDeposit}
				/>
      )}

      {/* <FishDrawer fishCollection={oceanFish}></FishDrawer> */}
      {fishToShow === FishView.Ocean && (
        <FishDrawer
          fishPool={PoolFish.Ocean}
          selectedOpponent={mySelectedFish}
          fishCollection={oceanFish}
          onClick={oceanFishClick}
        >
          <ToggleButton
            items={FishViewOptions}
            selected={fishToShow}
          ></ToggleButton>
        </FishDrawer>
      )}
      {fishToShow === FishView.User && (
        <FishDrawer
          buffModal={toggleModal}
          poolType={PoolTypes.Ocean}
          fishPool={PoolFish.User}
          selectedFish={mySelectedFish}
          fishCollection={userFish}
          onClick={oceanFishClick}
        >
          <>
            <ToggleButton
              items={FishViewOptions}
              selected={fishToShow}
            ></ToggleButton>
            {!account && <Account />}
            {account && userFish?.length === 0 && (
              <BaseLinkButton to={"/fishing"}>Catch a Fish!</BaseLinkButton>
            )}
          </>
        </FishDrawer>
      )}
    </BaseContainer>
  );
};

export default Ocean;
