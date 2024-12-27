import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit'
import { stockAPI } from '../../api/stock'

// 액션 생성
export const updateQuote = createAction('stock/updateQuote') // 주식 실시간 데이터 업데이트
export const quoteError = createAction('stock/quoteError') // 주식 실시간 데이터 오류
export const setConnectionStatus = createAction('stock/setConnectionStatus') // 연결 상태 업데이트

// 심볼 형식 처리 함수
const formatSymbol = (symbol) => {
   if (!symbol) return ''

   // 이미 .KS나 .KQ가 있는 경우
   if (/\.[A-Z]{2}$/.test(symbol)) {
      return symbol
   }

   // 6자리 숫자인 경우 (한국 주식)
   if (/^[0-9]{6}$/.test(symbol)) {
      return `${symbol}.KS`
   }

   // 미국 주식인 경우
   return symbol
}

// 주식 시세 구독 액션 생성 함수
export const subscribeToQuote = (symbol) => (dispatch) => {
   const formattedSymbol = formatSymbol(symbol) // 심볼 형식 처리
   let eventSource = null // 이벤트 소스
   let retryCount = 0 // 재시도 카운트
   const maxRetries = 3 // 최대 재시도 횟수
   const retryInterval = 3000 // 재시도 간격

   // 연결 시도 함수
   const connect = () => {
      if (eventSource) {
         eventSource.close()
      }

      eventSource = new EventSource(`${process.env.REACT_APP_API_URL}/stock/quote/${formattedSymbol}`) // 이벤트 소스 생성

      eventSource.onopen = () => {
         dispatch(setConnectionStatus(true)) // 연결 성공시 연결 상태 업데이트
         retryCount = 0 // 연결 성공시 재시도 카운트 초기화
      }

      eventSource.onmessage = (event) => {
         try {
            const data = JSON.parse(event.data) // 데이터 파싱
            if (data.error) {
               dispatch(quoteError(data.error)) // 오류 발생시 오류 메시지 업데이트
            } else {
               dispatch(updateQuote(data)) // 데이터 업데이트
            }
         } catch (error) {
            console.error('데이터 처리 오류:', error)
            dispatch(quoteError('데이터 처리 중 오류가 발생했습니다.')) // 오류 발생시 오류 메시지 업데이트
         }
      }

      eventSource.onerror = (error) => {
         console.error('SSE 연결 오류:', error)
         dispatch(setConnectionStatus(false)) // 연결 실패시 연결 상태 업데이트
         eventSource.close() // 이벤트 소스 닫기

         if (retryCount < maxRetries) {
            retryCount++ // 재시도 카운트 증가
            console.log(`재연결 시도 ${retryCount}/${maxRetries}`) // 재시도 카운트 출력
            setTimeout(connect, retryInterval) // 재시도 간격 설정
         } else {
            dispatch(quoteError('연결 실패: 최대 재시도 횟수를 초과했습니다.')) // 오류 발생시 오류 메시지 업데이트
         }
      }
   }

   connect()

   // 정리 함수 반환
   return () => {
      if (eventSource) {
         eventSource.close()
         dispatch(setConnectionStatus(false)) // 정리 시 연결 상태 업데이트
      }
   }
}

// 주식 검색
export const searchStocks = createAsyncThunk('stock/search', async (query, { rejectWithValue }) => {
   try {
      const response = await stockAPI.searchStocks(query)

      if (Array.isArray(response)) {
         return response
      }

      if (response?.quotes && Array.isArray(response.quotes)) {
         return response.quotes
      }

      return []
   } catch (error) {
      console.error('검색 오류:', error)
      return rejectWithValue(error.message)
   }
})

// 주식 조회
export const getQuote = createAsyncThunk('stock/getQuote', async (symbol, { rejectWithValue }) => {
   try {
      const response = await stockAPI.getQuote(symbol)
      return response
   } catch (error) {
      console.error('주식 조회 오류:', error)
      return rejectWithValue(error.message)
   }
})

const initialState = {
   searchResults: [],
   currentStock: null,
   chartData: null,
   marketOverview: null,
   isConnected: false,
   status: {
      search: 'idle',
      quote: 'idle',
      chart: 'idle',
   },
   error: {
      search: null,
      quote: null,
      chart: null,
   },
}

const stockSlice = createSlice({
   name: 'stock',
   initialState,
   reducers: {
      clearSearchResults: (state) => {
         state.searchResults = []
         state.status.search = 'idle'
         state.error.search = null
      },
      clearStockData: (state) => {
         state.currentStock = null
         state.chartData = null
         state.status.quote = 'idle'
         state.status.chart = 'idle'
         state.error.quote = null
         state.error.chart = null
      },
   },
   extraReducers: (builder) => {
      builder
         // 주식 검색
         .addCase(searchStocks.pending, (state) => {
            state.status.search = 'loading'
            state.error.search = null
         })
         .addCase(searchStocks.fulfilled, (state, action) => {
            state.status.search = 'succeeded'
            state.searchResults = Array.isArray(action.payload) ? action.payload : []
            state.error.search = null
         })
         .addCase(searchStocks.rejected, (state, action) => {
            state.status.search = 'failed'
            state.error.search = action.payload
            state.searchResults = []
         })
         // 주식 조회
         .addCase(getQuote.pending, (state) => {
            state.status.quote = 'loading'
            state.error.quote = null
         })
         .addCase(getQuote.fulfilled, (state, action) => {
            state.status.quote = 'succeeded'
            state.currentStock = action.payload
            state.error.quote = null
         })
         .addCase(getQuote.rejected, (state, action) => {
            state.status.quote = 'failed'
            state.error.quote = action.payload
            state.currentStock = null
         })
         // 실시간 업데이트
         .addCase(updateQuote, (state, action) => {
            state.currentStock = action.payload
            state.status.quote = 'succeeded'
            state.error.quote = null
         })
         .addCase(quoteError, (state, action) => {
            state.status.quote = 'failed'
            state.error.quote = action.payload
         })
         // 연결 상태 업데이트
         .addCase(setConnectionStatus, (state, action) => {
            state.isConnected = action.payload
         })
   },
})

export const { clearSearchResults, clearStockData } = stockSlice.actions // 액션 내보내기

export const selectSearchResults = (state) => state.stock?.searchResults || [] // 검색 결과 선택
export const selectCurrentStock = (state) => state.stock?.currentStock || null // 현재 주식 선택
export const selectStatus = (state) => state.stock?.status || { search: 'idle', quote: 'idle', chart: 'idle' } // 상태 선택
export const selectErrors = (state) => state.stock?.error || { search: null, quote: null, chart: null } // 오류 선택
export const selectConnectionStatus = (state) => state.stock?.isConnected ?? false // 연결 상태 선택

export default stockSlice.reducer
