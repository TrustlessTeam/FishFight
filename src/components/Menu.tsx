import { useState } from "react";
import styled from "styled-components";

const StyledUl = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: ${props => props.theme.spacing.gapSmall};
  overflow: hidden;
  list-style: none;
  display: flex;
  cursor: pointer;
  /* justify-content: center; */
  pointer-events: auto;

`;

const StyledLi = styled.li`
  float: left;
`;

const Dropbtn = styled.div`
  border: 2px solid white;
  display: relative;
  border-radius: ${props => props.theme.spacing.gapSmall};
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  min-width: 20%;
`;

const DropDownContent = styled.div<DropdownProps>`
  display: ${props => props.open ? "block" : "none"};
  position: absolute;
  background-color: #f9f9f9;
  min-width: 20%;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  bottom: 50px;
`;

const DropDownLi = styled(StyledLi)`
  display: inline-block;
  /* &:hover {
    background-color: red;
  }
  &:hover ${DropDownContent} {
    display: block;
  } */
`;

const StyledA = styled.a`
  display: inline-block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  &:hover {
    background-color: red;
  }
`;

const SubA = styled.a`
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
  onClick: (choice: string) => void;
  name: string;
  items: any;
};

const Menu = ({ onClick, name, items }: Props) => {
  const [open, setOpen] = useState<boolean>(false);

  const toggleDropdown = () => {
    console.log(items)
    console.log(open)
    setOpen(prevOpen => !prevOpen);
  };

  const handleSelectionClick = (choice: string) => {
    onClick(choice)
    toggleDropdown();
  }
	
	return (
    <StyledUl>
      <DropDownLi>
        <Dropbtn onClick={() => toggleDropdown()}>
          {name}
          <DropDownContent open={open}>
          {" "}
          {items.map((selection: any) => {
            return (
              <SubA onClick={() => handleSelectionClick(selection)}>{selection}</SubA>
            )
          })}
        </DropDownContent>
        </Dropbtn>
        
      </DropDownLi>
    </StyledUl>
  );
};

export default Menu;