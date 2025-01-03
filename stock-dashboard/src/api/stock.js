import axios from 'axios'

const RETRY_COUNT = 2 // 재시도 횟수
const RETRY_DELAY = 1000 // 재시도 간격

const api = axios.create({
   baseURL: `${process.env.REACT_APP_API_URL}/stock`,
   timeout: 15000, // 요청 타임아웃 15000 = 15초
   headers: {
      'Content-Type': 'application/json', // 요청 헤더 설정
      Accept: 'application/json', // Accept = json 형식으로 응답 받음
      'X-Requested-With': 'XMLHttpRequest', // XML형식으로 요청 받음
   },
})

// 재시도 함수
const retryRequest = async (fn, retries = RETRY_COUNT, delay = RETRY_DELAY) => {
   try {
      return await fn()
   } catch (error) {
      if (retries <= 0) throw error

      console.log(`요청 재시도... (남은 시도: ${retries})`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retryRequest(fn, retries - 1, delay)
   }
}

// 응답 인터셉터 설정, 응답 데이터 검증 및 오류 처리
api.interceptors.response.use(
   (response) => {
      if (response.data?.error) {
         return Promise.reject(new Error(response.data.error))
      }
      if (response.data?.quotes) {
         return response.data.quotes
      }
      return response.data
   },
   (error) => {
      console.error('API 에러 상세:', error.response || error)

      if (error.code === 'ECONNABORTED') {
         return Promise.reject(new Error('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'))
      }
      if (error.response?.status === 404) {
         const symbol = error.config?.url?.split('/').pop()?.split('?')[0]
         return Promise.reject(new Error(`${symbol || '요청하신'} 종목의 데이터를 찾을 수 없습니다.`))
      }
      if (error.response?.data?.error) {
         return Promise.reject(new Error(error.response.data.error))
      }
      return Promise.reject(new Error('서버 통신 중 오류가 발생했습니다.'))
   }
)

const generateTimestamp = (date, interval) => {
   const now = new Date()
   if (!date) {
      // 현재 시간을 기준으로 interval에 맞게 timestamp 생성
      const minutes = Math.floor(now.getMinutes() / Number(interval.replace('m', ''))) * Number(interval.replace('m', '')) // 분 계산
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), minutes).getTime() // 타임스탬프 생성
   }
   return new Date(date).getTime() // 타임스탬프 생성
}

// 심볼 형식 처리 함수
const formatSymbol = (symbol) => {
   if (!symbol) return '' // 심볼이 없으면 빈 문자열 반환

   // 이미 .KS나 .KQ가 있는 경우
   if (/\.[A-Z]{2}$/.test(symbol)) {
      return symbol // 심볼이 .KS나 .KQ로 끝나면 그대로 반환
   }

   // 6자리 숫자인 경우 (한국 주식)
   if (/^[0-9]{6}$/.test(symbol)) {
      return `${symbol}.KS` // 한국 주식인 경우 .KS 추가
   }

   // 미국 주식인 경우
   return symbol // 미국 주식인 경우 그대로 반환
}

export const stockAPI = {
   searchStocks: async (query) => {
      try {
         // 주식 검색 yahoo finance api 호출
         const response = await retryRequest(() =>
            api.get('/search', {
               params: { query },
               headers: {
                  Source: 'YAHOO',
               },
            })
         )
         return response
      } catch (error) {
         console.error('주식 검색 오류:', error)
         throw error
      }
   },

   // 주식 시세 조회
   getQuote: async (symbol) => {
      try {
         const formattedSymbol = formatSymbol(symbol)
         const response = await retryRequest(() =>
            api.get(`/quote/${formattedSymbol}/initial`, {
               headers: {
                  Source: 'YAHOO',
               },
            })
         )
         return response
      } catch (error) {
         console.error('주식 시세 조회 오류:', error)
         throw error
      }
   },

   // 주식 차트 조회
   getChart: async (symbol, { range = '1d', interval = '5m' } = {}) => {
      try {
         // 심볼 유효성 검사
         if (!symbol) {
            throw new Error('종목 심볼이 필요합니다.')
         }

         const formattedSymbol = formatSymbol(symbol)

         const response = await retryRequest(() =>
            api.get(`/chart/${formattedSymbol}`, {
               params: {
                  range,
                  interval,
                  source: 'YAHOO',
               },
               headers: {
                  Source: 'YAHOO',
               },
            })
         )

         // 응답 데이터 검증
         if (!response) {
            console.error('응답 없음:', formattedSymbol)
            throw new Error('차트 데이터를 받아올 수 없습니다.')
         }

         if (!Array.isArray(response)) {
            console.error('잘못된 응답 형식:', response)
            throw new Error('유효하지 않은 차트 데이터 형식')
         }

         // 빈 데이터 체크
         if (response.length === 0) {
            console.error('빈 데이터:', formattedSymbol)
            throw new Error('해당 기간의 차트 데이터가 없습니다.')
         }

         // 데이터 유효성 검사 및 변환
         const validData = response
            .map((item) => {
               try {
                  // timestamp를 우선 사용 (Yahoo Finance는 timestamp를 제공)
                  const timestamp = item.timestamp ? item.timestamp * 1000 : generateTimestamp(item.date, interval)

                  // 가격 데이터 검증
                  const close = Number(item.close)
                  if (isNaN(close) || close <= 0) {
                     console.error('유효하지 않은 가격:', item)
                     return null
                  }

                  return {
                     ...item,
                     date: new Date(timestamp).toISOString(),
                     timestamp,
                     close,
                     open: Number(item.open) || close,
                     high: Number(item.high) || close,
                     low: Number(item.low) || close,
                     volume: Number(item.volume) || 0,
                  }
               } catch (err) {
                  console.error('데이터 변환 오류:', err, item)
                  return null
               }
            })
            .filter(Boolean) // null 제거
            .sort((a, b) => a.timestamp - b.timestamp) // 시간순 정렬

         if (validData.length === 0) {
            console.error('유효한 데이터 없음:', formattedSymbol)
            throw new Error('유효한 차트 데이터가 없습니다.')
         }

         return validData
      } catch (error) {
         console.error('차트 데이터 요청 오류:', error)
         throw error
      }
   },

   // 시장 개요 조회
   getMarketOverview: async () => {
      try {
         const response = await retryRequest(() =>
            api.get('/market-overview', {
               headers: {
                  Source: 'YAHOO',
               },
            })
         )
         return response
      } catch (error) {
         console.error('시장 개요 조회 오류:', error)
         throw error
      }
   },

   // 주식 뉴스 조회
   getStockNews: async (symbol) => {
      try {
         const formattedSymbol = formatSymbol(symbol)
         const response = await retryRequest(() =>
            api.get(`/news/${formattedSymbol}`, {
               headers: {
                  Source: 'YAHOO',
               },
            })
         )
         return response
      } catch (error) {
         console.error('뉴스 조회 오류:', error)
         throw error
      }
   },
}
