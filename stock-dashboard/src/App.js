import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuthStatusThunk } from './store/slices/authSlice'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PostDetail from './pages/PostDetail'
import Posts from './pages/Posts'
import WritePost from './pages/WritePost'
import PopularPosts from './pages/PopularPosts'
import EditPost from './pages/EditPost'
import MyDashboard from './pages/MyDashboard'
import MarketPage from './pages/MarketPage'
import NotFound from './pages/NotFound'
import StockDetail from './pages/StockDetail'
import GlobalStyles from './styles/GlobalStyles'

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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/post/write" element={<WritePost />} />
            <Route path="/post/edit/:id" element={<EditPost />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/popular" element={<PopularPosts />} />
            <Route path="/market-overview" element={<MarketPage />} />
            <Route path="/mypage" element={<MyDashboard />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
         </Routes>
      </>
   )
}

export default App
