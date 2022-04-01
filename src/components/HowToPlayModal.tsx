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
  const [ackFishing, setAckFishing] = useLocalStorage<boolean>("ackFishing", true);
  const [ackFighting, setAckFighting] = useLocalStorage<boolean>("ackFighting", true);
  const [ackBreeding, setAckBreeding] = useLocalStorage<boolean>("ackBreeding", true);

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
              {oceanText > 0 &&
                <StateButton onClick={() => setOceanText(prev => prev - 1)}>Previous</StateButton>
              }
              {oceanText < 3 &&
                <StateButton onClick={() => setOceanText(prev => prev + 1)}>Next</StateButton>
              }
              {oceanText === 3 &&
                <StateButton onClick={() => {setAckOcean(false); setShowOceanHowTo(false)}}>Okay</StateButton>
              }
            </OptionsContainer>
          </Container>

          <ContainerLeft>
            
          {oceanText === 0 &&
            <Text>
            <span>View Fish!</span> The Ocean is the central location in FishFight to interact with your Fish and other player's Fish.
            </Text>
          }
          {oceanText === 1 &&
            <Text>
            <span>Feed Fish!</span> Feeding Fish $FISHFOOD increases their POWER level. <span>Power</span> is required for Breeding and certain Buffs.<br></br>
            Want to be a friendly player? Feed other players' Fish in the Ocean Fish tab. You might find helping others can be rewarding...
            <span>NOTE:</span> Feed All your eligible Fish from the FishFight menu by clicking the logo in top left corner.
            </Text>
          }
          {oceanText === 2 &&
            <Text>
            <span>Collect $FISHFOOD!</span>Each Fish you own is able to search for {web3.utils.fromWei(Constants._claimAmount)} FISHFOOD every {Constants._claimCooldown / (60)} hours!<br></br>
            <span>NOTE:</span> Collect All available $FISHFOOD from the FishFight menu.
            </Text>
          }
          {oceanText === 3 &&
            <Text>
            <span>Withdaw / Deposit from Pools!</span> Fish can be staked in Fighting and Breeding pools to earn rewards.<br></br>
            Learn more at the Fighting and Breeding waters.
            </Text>
          }
          </ContainerLeft>
          <SmallText>Click the (?) button in the upper right to refrence this info during gameplay.</SmallText>
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
            <Title>Welcome to the Fighting Waters!</Title>
            <OptionsContainer>
              {fightText > 0 &&
                <StateButton onClick={() => setFightText(prev => prev - 1)}>Previous</StateButton>
              }
              {fightText < 3 &&
                <StateButton onClick={() => setFightText(prev => prev + 1)}>Next</StateButton>
              }
              {fightText === 3 &&
                <StateButton onClick={() => {setAckFighting(false); setShowFightingHowTo(false)}}>Let's Fight!</StateButton>
              }
            </OptionsContainer>
          </Container>

          <ContainerLeft>
            {fightText === 0 &&
              <Text>
                <span>Fight to the Death!</span> Fish Fights are violent, risky, and rewarding!<br></br>
                Fighting is the core gameplay of FishFight. At launch there is one Fight option -- DEATH FIGHTS.<br></br>
                Death Fights result in the winning Fish gaining ALPHA status, and the losing Fish being eaten (token burned).
              </Text>
            }
            {fightText === 1 &&
              <Text>
                <span>Why Fight?</span> <br></br>
                Win $FISHFOOD - The winner eats the losing Fish and gains $FISHFOOD as a reward!<br></br>
                Gain ALPHA status - Alpha status allows a Fish to be deposited to the Breed Pool. <br></br>
                Increase Fish Kill Count - Kills are rare! More info on this will be coming soon...<br></br>
                It's SCARY and FUN!
              </Text>
            }
            {fightText === 2 &&
              <Text>
                <span>How to Fight?</span> <br></br>
                Select a BETTA Fish from My Fish - This is the Fish you are risking. At risk for {Constants._lockTime / 60} minutes.<br></br>
                Select an Opponent from Opponent Fish - This is the Fish you Fight!<br></br>
                Confirm the Fight! - If you haven't given approval, this will be required once.<br></br>
                FIGHT RESULTS! - Moment of truth! 
              </Text>
            }
            {fightText === 3 &&
              <Text>
                <span>How the winner is determined?</span> <br></br>
                3 Rounds are fought, each round uses Strength, Intelligence, or Agility to determine the winner.<br></br>
                The Fish that wins the most rounds, wins the Fight! A tie results in both Fish living.<br></br>
                We use a verified random function to guarantee random rounds.<br></br>
              </Text>
            }
          </ContainerLeft>
          
          <SmallText>Click the (?) button in the upper right to refrence this info during gameplay.</SmallText>

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
            <Title>Welcome to the Breeding Waters!</Title>
            <OptionsContainer>
              {breedText > 0 &&
                <StateButton onClick={() => setBreedText(prev => prev - 1)}>Previous</StateButton>
              }
              {breedText < 3 &&
                <StateButton onClick={() => setBreedText(prev => prev + 1)}>Next</StateButton>
              }
              {breedText === 3 &&
                <StateButton onClick={() => {setAckBreeding(false); setShowBreedingHowTo(false)}}>Let's Breed!</StateButton>
              }
            </OptionsContainer>
          </Container>

          <ContainerLeft>
            {breedText === 0 &&
              <Text>
                <span>Breeding!</span> Fish Fights are violent, risky, and rewarding!<br></br>

              </Text>
            }
            {breedText === 1 &&
              <Text>
                <span>Why Breed?</span> <br></br>
              </Text>
            }
            {breedText === 2 &&
              <Text>
                <span>How to Breed?</span> <br></br>
              </Text>
            }
            {breedText === 3 &&
              <Text>
                <span>How the offspring is determined?</span> <br></br>
              </Text>
            }
          </ContainerLeft>
          
          <SmallText>Click the (?) button in the upper right to refrence this info during gameplay.</SmallText>
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
            <Title>Welcome to the Fishing Waters!</Title>
            <OptionsContainer>
              {fishText > 0 &&
                <StateButton onClick={() => setFishText(prev => prev - 1)}>Previous</StateButton>
              }
              {fishText < 3 &&
                <StateButton onClick={() => setFishText(prev => prev + 1)}>Next</StateButton>
              }
              {fishText === 3 &&
                <BaseButton onClick={() => {setAckFishing(false); setShowFishingHowTo(false)}}>Let's Fish!</BaseButton>
              }
            </OptionsContainer>
          </Container>
          
          <ContainerLeft>
          {fishText === 0 &&
            <Text>
              <span>Let's catch you a Fish!</span> Fishing is the easiest way to become a $FISH owner. Hurry though!
              After 10,000 Fish have been caught (minted), random chance is enabled and Fishing becomes exceedingly more difficult.
            </Text>
          }
          {fishText === 1 &&
            <Text>
              <span>Cost to Fish?</span> Fishing is cyclical...Check the current phase in the FishFight menu in the upper left.<br></br>
              Fishing phase: {web3.utils.fromWei(Constants._fishingPriceInPhase)} ONE and Non-Fishing Phase: {web3.utils.fromWei(Constants._fishingPrice)} ONE.
            </Text>
          }
          {fishText === 2 &&
            <Text>
              <span>Is my Fish special?</span> Yes, all Fish are special, some more so than others...<br></br>
              Fish are generated on chain at time of catch (mint). Each Fish is made from 96+ unique traits.<br></br>
              These means no two Fish are the same.<br></br>
              Checkout existing Fish in the <Link to="/ocean">Ocean</Link>, the <a href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer">whitepaper</a>, or <a href="" target="_blank" rel="noopener noreferrer">NFTKEY listings</a> to see potential traits.<br></br>
            </Text>
          }
          {fishText === 3 &&
             <Text>
              <span>Why do I want a Fish?</span> Owning Fish is the entry point into the FishFight game!<br></br>
              FishFight aims to be a casual and fun-to-play collectable NFT game.<br></br>
              Use Fish to earn $FISHFOOD rewards through daily rewards, Fighting, Breeding, and special events!<br></br>
              Fish ownership grants you access to future community events, competitions, and tournaments.<br></br>
              Learn more in our <a href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer">whitepaper.</a>
            </Text>
          }     
          </ContainerLeft>
          
          <SmallText>Click the (?) button in the upper right to refrence this info during gameplay.</SmallText>
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

	@media ${props => props.theme.device.tablet} {
	  top: 100px;
  }
`;

const Wrapper = styled.div`
  padding: ${(props) => props.theme.spacing.gap};
  width: 100%;
  @media ${props => props.theme.device.tablet} {
    padding: ${(props) => props.theme.spacing.gapLarge};
	}
`;

const HowToModal = styled(StyledModal)`
  top: 60px;
  transform: translate(-50%, 0%);
  width: 100%;


  @media ${props => props.theme.device.tablet} {
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
	font-size: ${props => props.theme.font.normal};
  padding-bottom: ${(props) => props.theme.spacing.gap};


	span {
		color: #61daff;
	}

	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
	}
`;

const SmallText = styled(Text)`
	font-size: ${props => props.theme.font.small};
  padding: ${(props) => props.theme.spacing.gapSmall};
  @media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.small};
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
