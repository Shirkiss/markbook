import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import * as FaIcons from 'react-icons/fa'
import styled from 'styled-components'


import { SidebarData } from './SidebarData';

const Navbar = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  height: 3.5rem;
  background-color: #232345;
`

const MenuIconOpen = styled.div`
    display: flex;
    justify-content: start;
    font-size: 1.5rem;
    margin-left: 2rem;
    color: #ffffff;
`

const MenuIconClose = styled.div`
    display: flex;
    justify-content: end;
    font-size: 1.5rem;
    margin-top: 0.75rem;
    margin-right: 1rem;
    color: #ffffff;
`

const SidebarMenu = styled.div<{close: boolean}>`
    width: 50px;
    height: 100vh;
  background-color: #232345;
    position: fixed;
    top: 0;
    right: ${({ close}) => close ? '-100%' : '0'};
    transition: .6s;
`

const MenuItems = styled.li`
   list-style: none;
   display: flex;
   -webkit-box-align: center;
   align-items: center;
   -webkit-box-pack: start;
   justify-content: start;
   width: 100%;
   height: 15px;
   padding: 1rem 0px 1.25rem;
`

const ArrowSelected = styled.div`
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: 8px solid white;
`

const MenuItemDiv = styled.div`
    display: flex;
    align-items: center;
    margin: auto;
    font-size: 20px;
    text-decoration: none;
    color: #ffffff;
`

const Sidebar: React.FunctionComponent<{setCurrentTab:Function, currentTab: string}> = ({setCurrentTab, currentTab = 'Tabs'}) => {
    const [close, setClose] = useState(false)
    const showSidebar = () => setClose(!close)

   const handleMenuClick = (title: string) => {
        setCurrentTab(title);
   }

    return (
        <>
            <SidebarMenu close={close}>
                {SidebarData.map((item, index) => {
                    return (
                        <MenuItems key={index}>
                            {currentTab === item.title && <ArrowSelected />}
                            <MenuItemDiv onClick={() => handleMenuClick(item.title)}>
                                {item.icon}
                            </MenuItemDiv>
                        </MenuItems>
                    )
                })}
            </SidebarMenu>
        </>
    )
}

export default Sidebar