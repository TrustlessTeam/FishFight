import React, { useState } from "react";
import styled from "styled-components";
import { useWeb3React } from "@web3-react/core";
import web3 from "web3";
import { useLocalStorage } from "../helpers/localStorageHelper";

import {
  BaseContainer,
  BaseText,
  ContainerControls,
  StyledModal,
  Title,
} from "./BaseStyles";
import BaseButton from "./BaseButton";
import { useContractWrapper } from "../context/contractWrapperContext";
import { Constants } from "../utils/constants";
import { useFishFight } from "../context/fishFightContext";
import { Route, Routes } from "react-router-dom";
import { Link } from "react-router-dom";

const HowToPlayModal = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { account } = useWeb3React();
  const { currentPhase } = useFishFight();

  const [ackOcean, setAckOcean] = useLocalStorage<boolean>("ackOcean", true);
  const [ackFishing, setAckFishing] = useLocalStorage<boolean>(
    "ackFishing",
    true
  );
  const [ackFighting, setAckFighting] = useLocalStorage<boolean>(
    "ackFighting",
    true
  );
  const [ackBreeding, setAckBreeding] = useLocalStorage<boolean>(
    "ackBreeding",
    true
  );

  const [showOceanHowTo, setShowOceanHowTo] = useState(false);
  const [showBreedingHowTo, setShowBreedingHowTo] = useState(false);
  const [showFightingHowTo, setShowFightingHowTo] = useState(false);
  const [showFishingHowTo, setShowFishingHowTo] = useState(false);

  const [oceanText, setOceanText] = useState(0);
  const [fishText, setFishText] = useState(0);
  const [fightText, setFightText] = useState(0);
  const [breedText, setBreedText] = useState(0);

  // console.log(showFightingDisclaimer)

  const toggleModel = () => {
    setModalIsOpen(!modalIsOpen);
  };

  const AcceptButton = () => {};

  // console.log(onAccept)

  const HowToOcean = () => {
    return (
      <>
        <HowButton onClick={() => setShowOceanHowTo(true)}>?</HowButton>
        <HowToModal
          isOpen={showOceanHowTo || ackOcean}
          className="Modal"
          overlayClassName="Overlay"
          // onRequestClose={onAccept}
          shouldCloseOnOverlayClick
        >
          <Wrapper>
            <Container>
              <Title>Welcome to the Ocean!</Title>
              <OptionsContainer>
                {oceanText > 0 && (
                  <StateButton onClick={() => setOceanText((prev) => prev - 1)}>
                    Previous
                  </StateButton>
                )}
                {oceanText < 3 && (
                  <StateButton onClick={() => setOceanText((prev) => prev + 1)}>
                    Next
                  </StateButton>
                )}
                {oceanText === 3 && (
                  <StateButton
                    onClick={() => {
                      setAckOcean(false);
                      setShowOceanHowTo(false);
                    }}
                  >
                    Okay
                  </StateButton>
                )}
              </OptionsContainer>
            </Container>

            <ContainerLeft>
              {oceanText === 0 && (
                <Text>
                  <span>View Fish!</span> The Ocean is the central location in
                  FishFight to interact with your Fish and other player's Fish.
                </Text>
              )}
              {oceanText === 1 && (
                <Text>
                  <span>Feed Fish!</span> Feeding Fish $FISHFOOD increases their
                  POWER level. <span>Power</span> is required for Breeding and
                  certain Buffs.<br></br>
                  Want to be a friendly player? Feed other players' Fish in the
                  Ocean Fish tab. You might find helping others can be
                  rewarding...
                  <span>NOTE:</span> Feed All your eligible Fish from the
                  FishFight menu by clicking the logo in top left corner.
                </Text>
              )}
              {oceanText === 2 && (
                <Text>
                  <span>Collect $FISHFOOD!</span>Each Fish you own is able to
                  search for {web3.utils.fromWei(Constants._claimAmount)}{" "}
                  FISHFOOD every {Constants._claimCooldown / 60} hours!<br></br>
                  <span>NOTE:</span> Collect All available $FISHFOOD from the
                  FishFight menu.
                </Text>
              )}
              {oceanText === 3 && (
                <Text>
                  <span>Withdaw / Deposit from Pools!</span> Fish can be staked
                  in Fighting and Breeding pools to earn rewards.<br></br>
                  Learn more at the Fighting and Breeding waters.
                </Text>
              )}
            </ContainerLeft>
            <SmallText>
              Click the (?) button in the upper right to refrence this info
              during gameplay.
            </SmallText>
          </Wrapper>
        </HowToModal>
      </>
    );
  };

  const HowToFight = () => {
    return (
      <>
        <HowButton onClick={() => setShowFightingHowTo(true)}>?</HowButton>
        <HowToModal
          isOpen={showFightingHowTo || ackFighting}
          className="Modal"
          overlayClassName="Overlay"
          // onRequestClose={onAccept}
          shouldCloseOnOverlayClick
        >
          <Wrapper>
            <Container>
              <Title>Welcome to FIGHTING!</Title>
              <OptionsContainer>
                {fightText > 0 && (
                  <StateButton onClick={() => setFightText((prev) => prev - 1)}>
                    Previous
                  </StateButton>
                )}
                {fightText < 3 && (
                  <StateButton onClick={() => setFightText((prev) => prev + 1)}>
                    Next
                  </StateButton>
                )}
                {fightText === 3 && (
                  <StateButton
                    onClick={() => {
                      setAckFighting(false);
                      setShowFightingHowTo(false);
                    }}
                  >
                    Let's Fight!
                  </StateButton>
                )}
              </OptionsContainer>
            </Container>

            <ContainerLeft>
              {fightText === 0 && (
                <Text>
                  <span>Fight to the Death!</span> Fish Fights are violent,
                  risky, and rewarding!<br></br>
                  Fighting is the core gameplay of FishFight. At launch there is
                  one Fight option -- DEATH FIGHTS.<br></br>
                  Death Fights result in the winning Fish gaining ALPHA status,
                  and the losing Fish being eaten (token burned).
                </Text>
              )}
              {fightText === 1 && (
                <Text>
                  <span>Why Fight?</span> <br></br>
                  Win $FISHFOOD - The winner eats the losing Fish and gains
                  $FISHFOOD as a reward!<br></br>
                  Gain ALPHA status - Alpha status allows a Fish to be deposited
                  to the Breed Pool. <br></br>
                  Increase Fish Kill Count! More info on this
                  will be coming soon...<br></br>
                  It's RISKY but FUN!
                </Text>
              )}
              {fightText === 2 && (
                <Text>
                  <span>How to Fight?</span> <br></br>
                  Select a BETTA Fish from My Fish - This is the Fish you are
                  risking. At risk for {Constants._lockTime / 60} minutes.
                  <br></br>
                  Select an Opponent from Opponent Fish - This is the Fish you
                  Fight!<br></br>
                  Confirm the Fight! - If you haven't given approval, this will
                  be required once.<br></br>
                  FIGHT RESULTS! - Moment of truth!
                </Text>
              )}
              {fightText === 3 && (
                <Text>
                  <span>How the winner is determined?</span> <br></br>3 Rounds
                  are fought, each round uses Strength, Intelligence, or Agility
                  to determine the winner.<br></br>
                  The Fish that wins the most rounds, wins the Fight! A tie
                  results in both Fish living.<br></br>
                  We use a verified random function to guarantee random rounds.
                  <br></br>
                </Text>
              )}
            </ContainerLeft>

            <SmallText>
              Click the (?) button in the upper right to refrence this info
              during gameplay.
            </SmallText>
          </Wrapper>
        </HowToModal>
      </>
    );
  };

  const HowToBreed = () => {
    return (
      <>
        <HowButton onClick={() => setShowBreedingHowTo(true)}>?</HowButton>
        <HowToModal
          isOpen={showBreedingHowTo || ackBreeding}
          className="Modal"
          overlayClassName="Overlay"
          // onRequestClose={onAccept}
          shouldCloseOnOverlayClick
        >
          <Wrapper>
            <Container>
              <Title>Welcome to BREEDING!</Title>
              <OptionsContainer>
                {breedText > 0 && (
                  <StateButton onClick={() => setBreedText((prev) => prev - 1)}>
                    Previous
                  </StateButton>
                )}
                {breedText < 3 && (
                  <StateButton onClick={() => setBreedText((prev) => prev + 1)}>
                    Next
                  </StateButton>
                )}
                {breedText === 3 && (
                  <StateButton
                    onClick={() => {
                      setAckBreeding(false);
                      setShowBreedingHowTo(false);
                    }}
                  >
                    Let's Breed!
                  </StateButton>
                )}
              </OptionsContainer>
            </Container>

            <ContainerLeft>
              {breedText === 0 && (
                <Text>
                  <h2>
                    <span>Let's BREED a $FISH NFT!</span>{" "}
                  </h2>
                  <h4>
                    BREEDING is a way for BETTA $FISH to create new $FISH!
                  </h4>

                  <h5>
                    {" "}
                    There is no risk associated with BREEDING, like there is w/ FISHING.
                  </h5>
                </Text>
              )}
              {breedText === 1 && (
                <Text>
                  <span>Why Breed?</span> <br></br>
                  Breeding is primarily meant to be a luxury that people who want to try to choose what their $FISH looks like & which stats it's made of. 
                </Text>
              )}
              {breedText === 2 && (
                <Text>
                  <span>How to Breed?</span> <br></br>
                  <h3>A BETTA $FISH needs only find an ALPHA $FISH to pair with</h3>
                  <h4>
                    Any ALPHA $FISH can be deposited to become eligable to BREED 
                  </h4>
                  <h3>An ALPHA $FISH can only BREED a few times... Before they revert back into a BETTA</h3>
                  <h4>BETTA $FISH owners pay their selected ALPHA to BREED</h4>

                </Text>
              )}
              {breedText === 3 && (
                <Text>
                  <span>How the offspring is determined?</span> <br></br>

                  <h3> Any newly bred $FISH's UNIQUE GENES are</h3>
                  <h4>
                  minted 1 by 1, each with a chance of being inherited
                  </h4>
                  <h3>from their ALPHA or BETTA or a chance for a new</h3>
                  <h4>randomly generated UNIQUE GENE.</h4>
                </Text>
              )}
            </ContainerLeft>

            <SmallText>
              Click the (?) button in the upper right to refrence this info
              during gameplay.
            </SmallText>
          </Wrapper>
        </HowToModal>
      </>
    );
  };

  const HowToFish = () => {
    return (
      <>
        <HowButton onClick={() => setShowFishingHowTo(true)}>?</HowButton>
        <HowToModal
          isOpen={showFishingHowTo || ackFishing}
          className="Modal"
          overlayClassName="Overlay"
          // onRequestClose={onAccept}
          shouldCloseOnOverlayClick
        >
          <Wrapper>
            <Container>
              <Title>Welcome to FISHING!</Title>
              <OptionsContainer>
                {fishText > 0 && (
                  <StateButton onClick={() => setFishText((prev) => prev - 1)}>
                    Previous
                  </StateButton>
                )}
                {fishText < 3 && (
                  <StateButton onClick={() => setFishText((prev) => prev + 1)}>
                    Next
                  </StateButton>
                )}
                {fishText === 3 && (
                  <BaseButton
                    onClick={() => {
                      setAckFishing(false);
                      setShowFishingHowTo(false);
                    }}
                  >
                    Let's Fish!
                  </BaseButton>
                )}
              </OptionsContainer>
            </Container>

            <ContainerLeft>
              {fishText === 0 && (
                <Text>
                  <h2>
                    <span>Let's catch a $FISH NFT!</span>{" "}
                  </h2>
                  <h4>
                    FISHING can be the easiest way to become a $FISH owner!
                  </h4>
                  <h3>When there are less than 10,000 $FISH alive -</h3>
                  <h4>
                    Just pay the fee to bait, cast & catch(mint) your $FISH!
                  </h4>
                  <h3>When there are more than 10,000 $FISH alive -</h3>
                  <h4>You'll pay the fee to bait & cast... BUT!</h4>

                  <h5>
                    {" "}
                    $FISH will become harder to find, so you might not catch
                    one.
                  </h5>
                  <h5>
                    {" "}
                    if you don't catch a fish, you get some of your bait back as
                    $FISHFOOD
                  </h5>
                </Text>
              )}
              {fishText === 1 && (
                <Text>
                  <h2>
                    <span>Price of FISHING?</span>{" "}
                  </h2>
                  <h4>
                    FISHING price changes depending on the current PHASE :
                  </h4>
                  <h4>Check current PHASE by tapping the FishFight logo</h4>

                  <h2> FISHING PHASE price: </h2>
                  <h1>
                    {web3.utils.fromWei(Constants._fishingPriceInPhase)} ONE
                  </h1>
                  <h3> FIGHTING / BREEDING PHASE price: </h3>
                  <h1>{web3.utils.fromWei(Constants._fishingPrice)} ONE</h1>
                  <Text>
                    {" "}
                    if you don't catch a $FISH you'll still receive $FISHFOOD
                  </Text>
                </Text>
              )}
              {fishText === 2 && (
                <Text>
                  <h2>
                    <span>What's special about FISHING?</span>{" "}
                  </h2>
                  <h4>
                    When $FISH are caught, they're entirely generated on-chain
                    at time of catch (mint).
                  </h4>
                  Every Fish is made from 96+ UNIQUE GENES, which allows no two
                  $FISH to be the same.
                  <h4>
                    $FISH created from BREEDING are in-part made of their parent
                    $FISH, so FISHING $FISH are completely Random.
                  </h4>
                  <h2>
                    {" "}
                    Unlike BREEDING, $FISH Caught from FISHING are Generation: 0{" "}
                  </h2>
                  <Text>
                    Which means they can BREED more times than Gen 1 or Gen 2 etc... when they earn ALPHA status
                  </Text>
                </Text>
              )}
              {fishText === 3 && (
                <Text>
                  <h2>
                    <span>Why should anyone go FISHING?</span>{" "}
                  </h2>
                  <h4>
                    Owning a $FISH is the entry point into the FishFight game!
                  </h4>
                  FishFight aims to be a casual and fun-to-play collectable NFT
                  game.
                  <h4>
                    Use Fish to earn $FISHFOOD rewards through daily rewards,
                    FIGHTING, BREEDING, and future special events!
                  </h4>
                  <h4>
                    {" "}
                    Fish ownership grants you access to future community events,
                    competitions, and tournaments.{" "}
                  </h4>
                  <Text>
                  Learn more in our{" "}
                  <a
                    href="/whitepaper.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    whitepaper.
                  </a>
                    </Text>
                </Text>
              )}
            </ContainerLeft>

            <SmallText>
              Click the (?) button in the upper right to refrence this info
              during gameplay.
            </SmallText>
          </Wrapper>
        </HowToModal>
      </>
    );
  };

  return (
    <Routes>
      <Route path="/ocean" element={<HowToOcean />} />
      <Route path="/fishing" element={<HowToFish />} />
      <Route path="/fighting" element={<HowToFight />} />
      <Route path="/fighting/weak" element={<HowToFight />} />
      <Route path="/breeding" element={<HowToBreed />} />
    </Routes>
  );
};

export default HowToPlayModal;

const HowButton = styled(BaseButton)`
  position: absolute;
  top: 60px;
  right: 0;
  padding: 5px 14px !important;
  border-radius: 50%;
  margin: ${(props) => props.theme.spacing.gap};
  font-weight: bolder;
  font-size: 25px;

  &::before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 50%;
    background-image: linear-gradient(#ffffff, #e2e2e2);
    z-index: -1;
    transition: opacity 0.25s ease-in-out;
    opacity: 0;
  }

  @media ${(props) => props.theme.device.tablet} {
    top: 100px;
  }
`;

const Wrapper = styled.div`
  padding: ${(props) => props.theme.spacing.gap};
  width: 100%;
  @media ${(props) => props.theme.device.tablet} {
    padding: ${(props) => props.theme.spacing.gapLarge};
  }
`;

const HowToModal = styled(StyledModal)`
  top: 60px;
  transform: translate(-50%, 0%);
  width: 100%;

  @media ${(props) => props.theme.device.tablet} {
    top: 120px;
  }
`;

const StateButton = styled(BaseButton)`
  margin-right: ${(props) => props.theme.spacing.gap};
`;

const Text = styled.p`
  color: white;
  margin: 0;
  font-weight: bold;
  font-size: ${(props) => props.theme.font.normal};
  padding-bottom: ${(props) => props.theme.spacing.gap};

  span {
    color: #61daff;
  }

  @media ${(props) => props.theme.device.tablet} {
    font-size: ${(props) => props.theme.font.medium};
  }
`;

const SmallText = styled(Text)`
  font-size: ${(props) => props.theme.font.small};
  padding: ${(props) => props.theme.spacing.gapSmall};
  @media ${(props) => props.theme.device.tablet} {
    font-size: ${(props) => props.theme.font.small};
  }
`;

export const ContainerText = styled.div`
  padding-top: ${(props) => props.theme.spacing.gapSmall};
`;

export const ApprovalsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: ${(props) => props.theme.spacing.gap};
`;

export const ContainerLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  padding: ${(props) => props.theme.spacing.gap};
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* width: 100%; */
  height: 100%;
  padding: ${(props) => props.theme.spacing.gap};
`;

export const OptionsContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  padding: ${(props) => props.theme.spacing.gapSmall};
  /* width: 200px; */
`;
