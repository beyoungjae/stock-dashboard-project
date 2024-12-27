import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { checkAuthStatusThunk } from './store/slices/authSlice'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PostDetail from './pages/PostDetail'
import MyDashboard from './pages/MyDashboard'
import ChartPage from './pages/ChartPage'
import NotFound from './pages/NotFound'
import StockDetail from './pages/StockDetail'
import GlobalStyles from './styles/GlobalStyles'
import Navbar from './components/Navbar'

function App() {
   const dispatch = useDispatch()

   useEffect(() => {
      // 앱이 시작될 때 인증 상태 확인
      dispatch(checkAuthStatusThunk())
   }, [dispatch])

   return (
      <>
         <GlobalStyles />
         <Navbar />
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/dashboard" element={<MyDashboard />} />
            <Route path="/stock/:code" element={<ChartPage />} /> */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
         </Routes>
      </>
   )
}

export default App
