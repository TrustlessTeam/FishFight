import { useState } from "react";
import styled from "styled-components";

const Drop = styled.div`
  position: relative;
  display: inline-block;
  pointer-events: auto;
  cursor: pointer;
`;

const Dropbtn = styled.div`
  border: 2px solid white;
  border-radius: ${props => props.theme.spacing.gapSmall};
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  /* min-width: 20%; */
`;

const DropContent = styled.div<DropdownProps>`
  display: ${props => props.open ? "block" : "none"};
  position: absolute;
  background-color: #f9f9f9;
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

  const toggleDropdown = () => {
    console.log(items)
    console.log(open)
    setOpen(!open);
  };
	
	return (
    <Drop>
      <Dropbtn onClick={() => toggleDropdown()}>
        {name}
        <DropContent open={open}>
        {items.map((selection: MenuItem, index) => {
          return (
            <DropItem key={index} onClick={() => {
              toggleDropdown();
              selection.onClick();
            }}>{selection.name}</DropItem>
          )
        })}
      </DropContent>
      </Dropbtn>
    </Drop>
  );
};

export default Menu;