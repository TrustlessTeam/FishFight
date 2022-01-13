import { useState } from "react";
import styled from "styled-components";

const ToggleGroup = styled.div`
  display: flex;
  flex-flow: row nowrap;
  pointer-events: auto;
  cursor: pointer;
`;

const ToggleOption = styled.div`
  /* border: 2px solid white; */
  border-radius: ${props => props.theme.spacing.gap};
  color: black;
  background-color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  box-shadow: 
    0 0 20px 3px #fff;  /* inner white */
    //0 0 50px 30px #f0f, /* middle magenta */
    //0 0 70px 45px #0ff; /* outer cyan */
  /* min-width: 20%; */
  &.active {
    background-color: gray;
  }
`;

const DropContent = styled.div<DropdownProps>`
  display: ${props => props.open ? "block" : "none"};
  position: absolute;
  background-color: white;
  /* min-width: 20%; */
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  bottom: 50px;
`;



const DropItem= styled.a`
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
  &:hover {
    background-color: #f1f1f1;
  }
`;

interface DropdownProps {
	open: boolean;
}

type Props = {
  nameA: string,
  nameB: string,
  selectedOption: boolean;
  toggle: () => void;
}

// export type MenuItem = {
//   name: string;
//   selectedOption: boolean;
//   onClick: () => void;
//   // extra?: any;
// };

const Menu = ({nameA, nameB, toggle, selectedOption} : Props) => {
	return (
    <ToggleGroup>
      <ToggleOption className={selectedOption ? '' : 'active'} onClick={() => toggle()}>
        {nameA}
      </ToggleOption>
      <ToggleOption className={selectedOption ? 'active' : ''} onClick={() => toggle()}>
        {nameB}
      </ToggleOption>
    </ToggleGroup>
  );
};

export default Menu;