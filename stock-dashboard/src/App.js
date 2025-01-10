import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuthStatusThunk } from './store/slices/authSlice'
import Navbar from './components/shared/Navbar'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import PostDetail from './pages/Post/PostDetail'
import Posts from './pages/Post/Posts'
import WritePost from './pages/Post/WritePost'
import PopularPosts from './pages/Post/PopularPosts'
import EditPost from './pages/Post/EditPost'
import MyDashboard from './pages/User/MyDashboard'
import MarketPage from './pages/stock/MarketPage'
import NotFound from './pages/NotFound/NotFound'
import StockDetail from './pages/stock/StockDetail'
import UserDashboard from './pages/User/UserDashboard'
import GlobalStyles from './styles/GlobalStyles'
import LoginRoute from './components/redirect/LoginRoute'

function App() {
   const dispatch = useDispatch()
   const { isAuthenticated, user } = useSelector((state) => state.auth)

   useEffect(() => {
      dispatch(checkAuthStatusThunk())
   }, [dispatch])

   return (
      <>
         <GlobalStyles />
         <Navbar isAuthenticated={isAuthenticated} user={user} />
         <Routes>
            <Route path="/" element={<Home isAuthenticated={isAuthenticated} user={user} />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
            <Route
               path="/login"
               element={
                  <LoginRoute>
                     <Login />
                  </LoginRoute>
               }
            />
            <Route
               path="/signup"
               element={
                  <LoginRoute>
                     <Signup />
                  </LoginRoute>
               }
            />
            <Route path="/posts" element={<Posts />} />
            <Route path="/post/write" element={<WritePost />} />
            <Route path="/post/edit/:id" element={<EditPost />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/popular" element={<PopularPosts />} />
            <Route path="/market-overview" element={<MarketPage />} />
            <Route path="/mypage" element={<MyDashboard />} />
            <Route path="/dashboard/:userId" element={<UserDashboard />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
         </Routes>
      </>
   )
}

export default App
