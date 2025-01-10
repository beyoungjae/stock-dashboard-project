import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import { logoutUserThunk } from '../../store/slices/authSlice'

const Navbar = ({ user }) => {
   const [isMenuOpen, setIsMenuOpen] = useState(false)
   const dispatch = useDispatch()

   // 메뉴 열기/닫기
   const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen)
   }

   // 로그아웃
   const handleLogout = useCallback(() => {
      dispatch(logoutUserThunk())
         .unwrap()
         .then(() => {
            window.location.href = '/'
         })
         .catch((error) => {
            alert(error)
         })
   }, [dispatch])

   return (
      <>
         <NavContainer initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 100 }}>
            <MenuButton onClick={toggleMenu}>
               <MenuIcon />
            </MenuButton>
            <Logo to="/" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
               <LogoIcon>📈</LogoIcon>
               <LogoText>Stock Dashboard</LogoText>
            </Logo>
            <Nav>
               <AnimatePresence mode="wait">
                  {user ? (
                     <AuthenticatedNav key="auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <UserInfo>{user?.username}님 환영합니다</UserInfo>
                        <LogoutButton onClick={handleLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                           로그아웃
                        </LogoutButton>
                     </AuthenticatedNav>
                  ) : (
                     <UnauthenticatedNav key="unauth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <NavLink to="/login" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                           로그인
                        </NavLink>
                        <NavLink to="/signup" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                           회원가입
                        </NavLink>
                     </UnauthenticatedNav>
                  )}
               </AnimatePresence>
            </Nav>
         </NavContainer>

         <AnimatePresence>
            {isMenuOpen && (
               <>
                  <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleMenu} />
                  <SideMenu initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.3 }}>
                     <MenuHeader>
                        <MenuTitle>메뉴</MenuTitle>
                        <CloseButton onClick={toggleMenu}>
                           <CloseIcon />
                        </CloseButton>
                     </MenuHeader>
                     <MenuItem to="/" onClick={toggleMenu} whileHover={{ x: 10 }} whileTap={{ scale: 0.95 }}>
                        홈
                     </MenuItem>
                     <MenuItem to="/popular" onClick={toggleMenu} whileHover={{ x: 10 }} whileTap={{ scale: 0.95 }}>
                        인기 게시글
                     </MenuItem>
                     <MenuItem to="/posts" onClick={toggleMenu} whileHover={{ x: 10 }} whileTap={{ scale: 0.95 }}>
                        게시판
                     </MenuItem>
                     <MenuItem to="/market-overview" onClick={toggleMenu} whileHover={{ x: 10 }} whileTap={{ scale: 0.95 }}>
                        시장 개요
                     </MenuItem>
                     <MenuItem to="/mypage" onClick={toggleMenu} whileHover={{ x: 10 }} whileTap={{ scale: 0.95 }}>
                        마이페이지
                     </MenuItem>
                  </SideMenu>
               </>
            )}
         </AnimatePresence>
      </>
   )
}

const NavContainer = motion(styled.header`
   position: sticky;
   top: 0;
   z-index: 1000;
   background: ${({ theme }) => theme.colors.surface}CC;
   backdrop-filter: blur(10px);
   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
   display: flex;
   align-items: center;
   padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
`)

const MenuButton = styled.button`
   background: none;
   border: none;
   color: ${({ theme }) => theme.colors.text};
   cursor: pointer;
   padding: ${({ theme }) => theme.spacing.sm};
   margin-right: ${({ theme }) => theme.spacing.md};
   display: flex;
   align-items: center;
   justify-content: center;
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      color: ${({ theme }) => theme.colors.primary};
   }

   svg {
      font-size: 24px;
   }
`

const Logo = styled(motion(Link))`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.sm};
   text-decoration: none;
   color: ${({ theme }) => theme.colors.text};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`

const LogoIcon = styled.span`
   font-size: 24px;
`

const LogoText = styled.span`
   background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
   -webkit-background-clip: text;
   -webkit-text-fill-color: transparent;
`

const Nav = styled.nav`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.md};
   margin-left: auto;
`

const AuthenticatedNav = styled(motion.div)`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.md};
`

const UnauthenticatedNav = styled(motion.div)`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.md};
`

const UserInfo = styled.span`
   color: ${({ theme }) => theme.colors.text};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
`

const NavLink = styled(motion(Link))`
   color: ${({ theme }) => theme.colors.text};
   text-decoration: none;
   padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
   border-radius: ${({ theme }) => theme.borderRadius.small};
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      background: ${({ theme }) => theme.colors.background};
   }
`

const LogoutButton = styled(motion.button)`
   background: none;
   border: none;
   color: ${({ theme }) => theme.colors.error};
   cursor: pointer;
   padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
   border-radius: ${({ theme }) => theme.borderRadius.small};
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      background: ${({ theme }) => theme.colors.background};
   }
`

const Overlay = styled(motion.div)`
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: rgba(0, 0, 0, 0.5);
   z-index: 100;
`

const SideMenu = styled(motion.div)`
   position: fixed;
   top: 0;
   left: 0;
   width: 300px;
   height: 100%;
   background: ${({ theme }) => theme.colors.surface}F2;
   backdrop-filter: blur(10px);
   border-right: 1px solid ${({ theme }) => theme.colors.border};
   padding: ${({ theme }) => theme.spacing.xl};
   z-index: 101;
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.md};
`

const MenuHeader = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const MenuTitle = styled.h2`
   margin: 0;
   font-size: ${({ theme }) => theme.typography.fontSizes.xl};
   color: ${({ theme }) => theme.colors.text};
`

const CloseButton = styled.button`
   background: none;
   border: none;
   color: ${({ theme }) => theme.colors.text};
   cursor: pointer;
   padding: ${({ theme }) => theme.spacing.sm};
   display: flex;
   align-items: center;
   justify-content: center;
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      color: ${({ theme }) => theme.colors.primary};
   }

   svg {
      font-size: 24px;
   }
`

const MenuItem = styled(motion(Link))`
   color: ${({ theme }) => theme.colors.text};
   text-decoration: none;
   padding: ${({ theme }) => theme.spacing.md};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   transition: ${({ theme }) => theme.transitions.quick};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};

   &:hover {
      background: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.primary};
   }
`

export default Navbar
