import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useWeb3React } from "@web3-react/core";
import { useFishFight } from '../../context/fishFightContext';

const NavIcon = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const NavLabel = styled.span`
  font-size: 0.8rem;
  opacity: 0.8;
`;

const NavBar: React.FC = () => {
  const { account, active } = useWeb3React();
  const { 
    balanceFish, 
    balanceFightFish, 
    balanceBreedFish,
    balanceFood
  } = useFishFight();

  return (
    <NavContainer>
      <NavIcons>
        <NavIconLink to="/ocean">
          <NavIcon>🌊</NavIcon>
          <NavLabel>Ocean</NavLabel>
        </NavIconLink>
        <NavIconLink to="/fishing">
          <NavIcon>🎣</NavIcon>
          <NavLabel>Fishing</NavLabel>
        </NavIconLink>
        <NavIconLink to="/fighting" className="active">
          <NavIcon>⚔️</NavIcon>
          <NavLabel>Fighting</NavLabel>
        </NavIconLink>
        <NavIconLink to="/breeding">
          <NavIcon>🐟</NavIcon>
          <NavLabel>Breeding</NavLabel>
        </NavIconLink>
      </NavIcons>
      
      <WalletInfo>
        {active ? (
          <>
            <InfoItem>
              <span>{balanceFood || '0'} $FISHFOOD</span>
              <span>{account?.slice(0, 6)}...{account?.slice(-4)}</span>
            </InfoItem>
            <InfoItem>
              <span>{balanceFish || '0'} 🌊</span>
              <span>{balanceFightFish || '0'} ⚔️</span>
              <span>{balanceBreedFish || '0'} 🐟</span>
            </InfoItem>
          </>
        ) : (
          <InfoItem>
            <span>Wallet not connected</span>
          </InfoItem>
        )}
      </WalletInfo>
    </NavContainer>
  );
};

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
  border-radius: 8px;
`;

const NavIcons = styled.div`
  display: flex;
  gap: 1rem;
`;

const NavIconLink = styled(Link)`
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: white;
  
  &.active {
    ${NavIcon} {
      background: rgba(74, 144, 226, 0.3);
      border-color: #4a90e2;
    }
    ${NavLabel} {
      color: #4a90e2;
    }
  }
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: white;
`;

const InfoItem = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  
  span {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }
`;

export default NavBar; 