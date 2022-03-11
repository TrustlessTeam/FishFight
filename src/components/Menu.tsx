import { useState } from "react";
import styled from "styled-components";
import dropdownImg from "../img/icons/dropdown.svg"
import useSound from 'use-sound';
import { BaseButtonStyle } from "./BaseStyles";



const Drop = styled.div`
  position: relative;
  display: inline-block;
  pointer-events: auto;
  cursor: pointer;
`;

const Dropbtn = styled(BaseButtonStyle)`
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  border-radius: 10px;
  border: none;
  color: black;

  text-align: center;
  padding: 6px 20px;
	font-size: ${props => props.theme.font.small};
  text-decoration: none;
  text-transform: uppercase;

  background-image: linear-gradient(#ffffff, #adadad);
  z-index: 1;
  box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .3), inset -2px -2px 2px rgba(0, 0, 0, .3);
  transition: all 0.5s ease-out;

  @media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
    padding: 10px 24px;
  }

  &:hover {
		cursor: pointer;
	}

  &::before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 10px;
    background-image: linear-gradient(#ffffff, #e2e2e2);
    z-index: -1;
    transition: opacity 0.25s ease-in-out;
    opacity: 0;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const DropContent = styled.div<DropdownProps>`
  display: ${props => props.open ? "block" : "none"};
  position: absolute;
  background-color: white;
  /* min-width: 20%; */
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  bottom: 30px;
  left: 0;
  right: 0;
  @media ${props => props.theme.device.tablet} {
    bottom: 50px;
  }
`;



const DropItem= styled.a`
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  text-transform: uppercase;
  display: block;
  text-align: left;
  &:hover {
    background-color: #f1f1f1;
  }
`;

const LogoImg = styled.img<{open: boolean}>`
  transform: ${p => (p.open ? "rotate(180deg)" : "rotate(0deg)")};
	height: 15px;

	@media ${props => props.theme.device.tablet} {
	  height: 20px;
  }
`;

interface DropdownProps {
	open: boolean;
}

type Props = {
  name: string,
  items: MenuItem[]
}

export type MenuItem = {
  name: string;
  onClick: () => void;
  // extra?: any;
};

const Menu = ({name, items} : Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [playClick] = useSound('click.wav', {volume: 0.25});

  const toggleDropdown = () => {
    console.log(items)
    console.log(open)
    setOpen(!open);
    playClick();
  };
	
	return (
    <Drop>
      <Dropbtn onClick={() => toggleDropdown()}>
        {name}
        <LogoImg open={open} src={dropdownImg} alt={"Dropdown arrow"}></LogoImg>
        <DropContent open={open}>
          {items.map((selection: MenuItem, index) => {
            return (
              <DropItem key={index} onClick={() => {
                toggleDropdown();
                console.log(selection)
                selection.onClick();
                playClick();
              }}>{selection.name}</DropItem>
            )
          })}
        </DropContent>
      </Dropbtn>
    </Drop>
  );
};

export default Menu;