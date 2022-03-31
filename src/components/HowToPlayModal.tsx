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
      <StyledModal
        isOpen={showOceanHowTo || ackOcean}
        className="Modal"
        overlayClassName="Overlay"
        // onRequestClose={onAccept}
        shouldCloseOnOverlayClick
      >
        <ApprovalsContainer>
          <ApprovalDisclaimer>
            <Title>Welcome to the Ocean!</Title>
            <ContainerText>
              <Text>
                <span>Interact with Fish!</span>
              </Text>
              <OptionsContainer>
                {/* {!fightingFishApproval && !checked &&
                  <BaseButton onClick={() => contractApproveAllForFighting()}>{'Approve All $FISH'}</BaseButton>
                } */}
              </OptionsContainer>
            </ContainerText>
            <BaseButton onClick={() => {setAckOcean(false); setShowOceanHowTo(false)}}>Okay</BaseButton>
          </ApprovalDisclaimer>
        </ApprovalsContainer>
      </StyledModal>
      </>
      
    );
  };

	const HowToFight = () => {
    return (
      <>
      <HowButton onClick={() => setShowFightingHowTo(true)}>?</HowButton>
      <StyledModal
        isOpen={showFightingHowTo || ackFighting}
        className="Modal"
        overlayClassName="Overlay"
        // onRequestClose={onAccept}
        shouldCloseOnOverlayClick
      >
        <ApprovalsContainer>
          <ApprovalDisclaimer>
            <Title>Welcome to the Fighting Waters!</Title>
            <ContainerText>
              <Text>
                <span>Let's catch you a Fish!</span>
              </Text>
              <OptionsContainer>
                {/* {!fightingFishApproval && !checked &&
                  <BaseButton onClick={() => contractApproveAllForFighting()}>{'Approve All $FISH'}</BaseButton>
                } */}
              </OptionsContainer>
            </ContainerText>
            <BaseButton onClick={() => {setAckFighting(false); setShowFightingHowTo(false)}}>Okay</BaseButton>
          </ApprovalDisclaimer>
        </ApprovalsContainer>
      </StyledModal>
      </>
      
    );
  };

  const HowToBreed = () => {
    return (
      <>
      <HowButton onClick={() => setShowBreedingHowTo(true)}>?</HowButton>
      <StyledModal
        isOpen={showBreedingHowTo || ackBreeding}
        className="Modal"
        overlayClassName="Overlay"
        // onRequestClose={onAccept}
        shouldCloseOnOverlayClick
      >
        <ApprovalsContainer>
          <ApprovalDisclaimer>
            <Title>Welcome to the Breeding Waters!</Title>
            <ContainerText>
              <Text>
                <span>Let's talk about Breeding!</span>
              </Text>
              <OptionsContainer>
                {/* {!fightingFishApproval && !checked &&
                  <BaseButton onClick={() => contractApproveAllForFighting()}>{'Approve All $FISH'}</BaseButton>
                } */}
              </OptionsContainer>
            </ContainerText>
            <BaseButton onClick={() => {setAckBreeding(false); setShowBreedingHowTo(false)}}>Okay</BaseButton>
          </ApprovalDisclaimer>
        </ApprovalsContainer>
      </StyledModal>
      </>
      
    );
  };

  const HowToFish = () => {
    return (
      <>
      <HowButton onClick={() => setShowFishingHowTo(true)}>?</HowButton>
      <StyledModal
        isOpen={showFishingHowTo || ackFishing}
        className="Modal"
        overlayClassName="Overlay"
        // onRequestClose={onAccept}
        shouldCloseOnOverlayClick
      >
        <ApprovalsContainer>
          <ApprovalDisclaimer>
            <Title>Welcome to the Fishing Waters!</Title>
            <ContainerText>
              <Text>
                <span>Let's catch you a Fish!</span>
              </Text>
              <OptionsContainer>
                {/* {!fightingFishApproval && !checked &&
                  <BaseButton onClick={() => contractApproveAllForFighting()}>{'Approve All $FISH'}</BaseButton>
                } */}
              </OptionsContainer>
            </ContainerText>
            <BaseButton onClick={() => {setAckFishing(false); setShowFishingHowTo(false)}}>Okay</BaseButton>
          </ApprovalDisclaimer>
        </ApprovalsContainer>
      </StyledModal>
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

const Text = styled.p`
  color: white;
  margin: 0;
  font-weight: bold;
  padding-bottom: ${(props) => props.theme.spacing.gap};

  span {
    color: red;
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

export const ApprovalDisclaimer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${(props) => props.theme.spacing.gap};
  border-radius: 25px;
	z-index: 10;
`;

export const OptionsContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`;
