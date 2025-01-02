const express = require('express')
const router = express.Router()
const yahooFinance = require('yahoo-finance2').default

// 콘솔 로그에 yahoo-finance2 라이브러리 설문 조사 출력 제거
yahooFinance.suppressNotices(['yahooSurvey'])

// 차트 데이터 캐시
const chartCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5분

// Yahoo Finance API 설정
const yahooFinanceOptions = {
   queue: {
      concurrent: 1, // 동시 요청 수 (1로 제한)
      timeout: 30000, // 요청 간격 (30000ms = 30초)
      intervalCap: 1, // 요청 제한 (1로 제한)
   },
   fetchOptions: {
      timeout: 30000, // 요청 타임아웃 (30초)
      headers: {
         // User-Agent 예시
         /* 
         firefox(맥용) < pc에서는 이렇게 설정해야 함 모바일에서는 잘 안됨
         Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0

         safari(ios용) < 모바일에서는 이렇게 설정해야 함 pc에서는 잘 안됨
         Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1

         windows chrome (winodws용)
         Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
         Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36
         */
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
         'Accept-Language': 'en-US,en;q=0.9', // 언어 설정
         Accept: 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', // Accept: 서버가 반환할 수 있는 콘텐츠 타입 지정
         'Accept-Encoding': 'gzip, deflate, br', // 클라이언트가 이해할 수 있는 압축 방식 지정
         Connection: 'keep-alive', // 연결 유지
         'Cache-Control': 'no-cache', // 캐싱 방지
         Pragma: 'no-cache', // 캐싱 방지 (하위 호환성)
      },
   },
}

// 시장 개장시간 체크
const isMarketOpen = (symbol) => {
   const now = new Date()
   const options = { timeZone: 'Asia/Seoul', hour12: false }
   const korTime = new Date(now.toLocaleString('en-US', options))
   const day = korTime.getDay()
   const hour = korTime.getHours()
   const minute = korTime.getMinutes()

   if (symbol.endsWith('.KS')) {
      // 한국 시장은 평일 오전 9시부터 오후 3시 30분까지 개장
      return day >= 1 && day <= 5 && ((hour === 9 && minute >= 0) || (hour > 9 && hour < 15) || (hour === 15 && minute < 30))
   } else {
      // 미국 시장은 평일 오전 9시 30분부터 오후 4시까지 개장
      const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York', hour12: false }))
      const nyDay = nyTime.getDay()
      const nyHour = nyTime.getHours()
      const nyMinute = nyTime.getMinutes()
      return nyDay >= 1 && nyDay <= 5 && ((nyHour === 9 && nyMinute >= 30) || (nyHour > 9 && nyHour < 16) || (nyHour === 16 && nyMinute === 0))
   }
}

// 데이터 포맷팅
const formatQuoteData = (quote, marketStatus = 'CLOSED') => ({
   symbol: quote.symbol, // 심볼
   name: quote.shortName || quote.longName, // 이름
   price: quote.regularMarketPrice, // 가격
   change: quote.regularMarketChange, // 변동
   changePercent: quote.regularMarketChangePercent, // 변동률
   volume: quote.regularMarketVolume, // 거래량
   marketCap: quote.marketCap, // 시가총액
   exchange: quote.exchange, // 거래소
   fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh, // 52주 최고가
   fiftyTwoWeekLow: quote.fiftyTwoWeekLow, // 52주 최저가
   marketStatus, // 시장 상태
   timestamp: new Date().toISOString(), // 타임스탬프: 현재 시간
})

// 날짜 범위 계산 함수
const getDateRange = (range, symbol) => {
   const end = new Date()
   let start = new Date()

   switch (range) {
      case '1d':
         start.setDate(end.getDate() - 2) // 여유 데이터 포함
         break
      case '5d':
         start.setDate(end.getDate() - 7) // 주말 고려
         break
      case '1mo':
         start.setMonth(end.getMonth() - 2) // 여유 기간 포함
         break
   }

   return {
      period1: Math.floor(start.getTime() / 1000),
      period2: Math.floor(end.getTime() / 1000),
   }
}

// 개장시간 확인 간격 설정
const getIntervalForRange = (range, symbol) => {
   const marketOpen = isMarketOpen(symbol)

   switch (range) {
      case '1d':
         return marketOpen ? '5m' : '15m'
      case '5d':
         return '15m' // 항상 15분 간격 유지
      case '1mo':
         return '1d' // 일간 데이터
      default:
         return '1d'
   }
}

// 초기 시세 조회 엔드포인트
router.get('/quote/:symbol/initial', async (req, res) => {
   const { symbol } = req.params

   if (!symbol) {
      return res.status(400).json({ error: '종목 심볼이 필요합니다.' })
   }

   try {
      const quote = await yahooFinance.quote(symbol, yahooFinanceOptions)
      if (!quote) {
         return res.status(404).json({ error: '시세 데이터를 찾을 수 없습니다.' })
      }

      const marketOpen = isMarketOpen(symbol)
      const data = formatQuoteData(quote, marketOpen ? 'OPEN' : 'CLOSED')

      return res.json(data)
   } catch (error) {
      console.error('시세 조회 오류:', error)
      return res.status(500).json({ error: '시세 조회 중 오류가 발생했습니다.' })
   }
})

// 주식 검색
router.get('/search', async (req, res) => {
   try {
      const { query } = req.query
      if (!query) {
         return res.status(400).json({ error: '검색어가 필요합니다.' })
      }

      const results = await yahooFinance.search(query, {
         newsCount: 0,
         quotesCount: 10,
         enableFuzzyQuery: true,
         enableNavLinks: false,
      })

      return res.json(results.quotes || [])
   } catch (error) {
      console.error('주식 검색 오류:', error)
      return res.status(500).json({ error: '주식 검색 중 오류가 발생했습니다.' })
   }
})

// 실시간 시세 조회
router.get('/quote/:symbol', async (req, res) => {
   const { symbol } = req.params

   if (!symbol) {
      return res.status(400).json({ error: '종목 심볼이 필요합니다.' })
   }

   // SSE 헤더 설정
   res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
   })

   // 연결 시작 알림
   res.write('event: connected\n')
   res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`)

   let intervalId = null
   let heartbeatId = null

   const sendQuoteData = async () => {
      try {
         if (res.writableEnded) return

         const quote = await yahooFinance.quote(symbol, yahooFinanceOptions)
         if (!quote) {
            throw new Error('시세 데이터를 받아올 수 없습니다.')
         }

         const marketOpen = isMarketOpen(symbol)
         const data = formatQuoteData(quote, marketOpen ? 'OPEN' : 'CLOSED')

         if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify(data)}\n\n`)
         }
      } catch (error) {
         console.error('시세 조회 오류:', error)
         if (!res.writableEnded) {
            res.write(`event: error\ndata: ${JSON.stringify({ error: '시세 조회 중 오류가 발생했습니다.' })}\n\n`)
         }
      }
   }

   // 하트비트 전송
   heartbeatId = setInterval(() => {
      if (!res.writableEnded) {
         res.write(':keepalive\n\n')
      }
   }, 30000)

   // 초기 데이터 전송
   await sendQuoteData()

   // 시장 상태에 따른 업데이트 간격 설정
   const updateInterval = isMarketOpen(symbol) ? 10000 : 60000 // 장중: 10초, 장외: 1분
   intervalId = setInterval(sendQuoteData, updateInterval)

   // 연결 종료 처리
   const cleanup = () => {
      if (intervalId) clearInterval(intervalId)
      if (heartbeatId) clearInterval(heartbeatId)
      if (!res.writableEnded) {
         res.end()
      }
   }

   req.on('close', cleanup)
   req.on('error', cleanup)
   res.on('error', cleanup)
})

// 차트 데이터 조회
router.get('/chart/:symbol', async (req, res) => {
   try {
      const { symbol } = req.params
      const { range = '1d', interval = '5m' } = req.query

      if (!symbol) {
         return res.status(400).json({ error: '종목 심볼이 필요합니다.' })
      }

      const cacheKey = `${symbol}-${range}-${interval}`
      const cachedData = chartCache.get(cacheKey)
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
         return res.json(cachedData.data)
      }

      const { period1, period2 } = getDateRange(range, symbol)
      const adjustedInterval = getIntervalForRange(range, symbol)

      const queryOptions = {
         period1,
         period2,
         interval: adjustedInterval,
         includePrePost: true,
         events: 'div,splits',
      }

      let retryCount = 0
      let result = null
      while (retryCount < 3) {
         try {
            result = await yahooFinance.chart(symbol, queryOptions)
            if (result && result.quotes && result.quotes.length > 0) {
               break
            }
            throw new Error('데이터가 비어있습니다.')
         } catch (error) {
            retryCount++
            if (retryCount === 3) throw error
            await new Promise((resolve) => setTimeout(resolve, 2000))
         }
      }

      const chartData = result.quotes
         .map((quote) => {
            if (!quote.date) return null

            const timestamp = Math.floor(quote.date.getTime() / 1000)
            const close = Number(quote.close)
            const open = Number(quote.open) || close
            const high = Number(quote.high) || close
            const low = Number(quote.low) || close
            const volume = Number(quote.volume) || 0

            if (isNaN(timestamp) || isNaN(close) || close <= 0) return null

            return {
               timestamp,
               date: new Date(timestamp * 1000).toISOString(),
               open,
               high,
               low,
               close,
               volume,
            }
         })
         .filter(Boolean)

      const validateChartData = (data, range) => {
         const minimumDataPoints = {
            '1d': 78,
            '5d': 130,
            '1mo': 20,
         }

         return data.length >= minimumDataPoints[range]
      }

      if (validateChartData(chartData, range)) {
         chartCache.set(cacheKey, {
            timestamp: Date.now(),
            data: chartData,
         })
      }

      return res.json(chartData)
   } catch (error) {
      return res.status(500).json({
         error: '차트 데이터 조회 중 오류가 발생했습니다.',
         details: error.message,
      })
   }
})

// 시장 개요 조회
router.get('/market-overview', async (req, res) => {
   try {
      const indices = ['^GSPC', '^DJI', '^IXIC', '^KS11', '^KQ11'] // S&P 500, 다우, 나스닥, 코스피, 코스닥

      // 병렬로 시세 조회
      const quotes = await Promise.all(
         indices.map(async (symbol) => {
            try {
               const quote = await yahooFinance.quote(symbol)
               if (!quote || !quote.regularMarketPrice) {
                  console.error(`${symbol} 시세 데이터가 유효하지 않습니다.`)
                  return null
               }

               return {
                  symbol: quote.symbol,
                  name: quote.shortName || quote.longName || 'N/A', // 이름이 없는 경우 기본값 설정
                  price: quote.regularMarketPrice || 0, // 가격이 없는 경우 기본값 설정
                  change: quote.regularMarketChange || 0, // 변동이 없는 경우 기본값 설정
                  changePercent: quote.regularMarketChangePercent || 0, // 변동률이 없는 경우 기본값 설정
                  marketState: quote.marketState || 'CLOSED', // 시장 상태가 없는 경우 기본값 설정
                  regularMarketPreviousClose: quote.regularMarketPreviousClose || 0, // 전일 종가가 없는 경우 기본값 설정
                  currency: quote.currency || 'USD', // 통화가 없는 경우 기본값 설정
                  regularMarketVolume: quote.regularMarketVolume || 0, // 거래량이 없는 경우 기본값 설정
                  fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0, // 52주 최고가가 없는 경우 기본값 설정
                  fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0, // 52주 최저가가 없는 경우 기본값 설정
               }
            } catch (error) {
               console.error(`${symbol} 시세 조회 오류:`, error.message)
               return null
            }
         })
      )

      // 유효한 데이터만 필터링 (null, undefined, 잘못된 데이터 제거)
      const validQuotes = quotes.filter((quote) => quote && quote.price !== undefined && quote.change !== undefined && quote.changePercent !== undefined)

      if (validQuotes.length === 0) {
         return res.status(404).json({ error: '시장 데이터를 찾을 수 없습니다.' })
      }

      return res.json(validQuotes)
   } catch (error) {
      console.error('시장 개요 조회 오류:', error.message)
      return res.status(500).json({ error: '시장 개요 조회 중 오류가 발생했습니다.' })
   }
})

module.exports = router
