const express = require('express')
const router = express.Router()
const yahooFinance = require('yahoo-finance2').default

// 차트 데이터 캐시
const chartCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5분

// Yahoo Finance API 설정
const yahooFinanceOptions = {
   queue: {
      concurrent: 1, // 동시 요청 수 (1로 제한)
      interval: 5000, // 요청 간격 (5000ms = 5초)
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
         Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)' + ' Chrome/95.0.4638.69 Safari/537.36
         */
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)' + ' Chrome/95.0.4638.69 Safari/537.36',
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
   const day = now.getDay()

   if (day === 0 || day === 6) return false // 주말 휴장

   if (symbol.endsWith('.KS')) {
      const korTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
      const hour = korTime.getHours()
      return hour >= 9 && hour < 15.5 // 한국 시장 개장 시간
   }

   const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
   const hour = nyTime.getHours()
   return hour >= 9.5 && hour < 16 // 미국 시장 개장 시간
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
const getDateRange = (range) => {
   const end = new Date()
   let start = new Date()

   switch (range) {
      case '1d':
         start = new Date(end)
         start.setHours(0, 0, 0, 0)
         // 미국 주식의 경우 전날 데이터도 포함
         if (end.getHours() < 9) {
            start.setDate(start.getDate() - 1)
         }
         break
      case '5d':
         start.setDate(end.getDate() - 5)
         break
      case '1mo':
         start.setMonth(end.getMonth() - 1)
         break
      default:
         start.setDate(end.getDate() - 1)
   }

   return {
      period1: start,
      period2: end,
   }
}

// Yahoo Finance 인터벌 변환
const convertInterval = (interval, range) => {
   // 범위에 따른 인터벌 조정
   if (range === '1d') {
      return '5m'
   } else if (range === '5d') {
      return '15m'
   } else if (range === '1mo') {
      return '1d'
   }
   return interval
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
      'Content-Type': 'text/event-stream', // SSE 헤더 설정 실시간으로 시세를 조회하려면 필요
      'Cache-Control': 'no-cache', // 캐시 방지
      Connection: 'keep-alive', // 연결 유지
      'Access-Control-Allow-Origin': '*', // 모든 출처 허용
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

      console.log('차트 데이터 요청:', { symbol, range, interval })

      // 캐시 확인
      const cacheKey = `${symbol}-${range}-${interval}`
      const cachedData = chartCache.get(cacheKey)
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
         console.log('캐시된 데이터 반환:', symbol)
         return res.json(cachedData.data)
      }

      // 날짜 범위 계산
      const { period1, period2 } = getDateRange(range)

      // Yahoo Finance API 옵션 설정
      const queryOptions = {
         ...yahooFinanceOptions,
         period1,
         period2,
         interval: convertInterval(interval, range),
         includePrePost: true, // 장전/장후 데이터 포함
         events: 'div,splits',
      }

      console.log('Yahoo Finance API 요청:', {
         symbol,
         period1: period1.toISOString(),
         period2: period2.toISOString(),
         interval: queryOptions.interval,
      })

      // API 호출 재시도 로직
      let retryCount = 0
      let result
      while (retryCount < 3) {
         try {
            result = await yahooFinance.chart(symbol, queryOptions)
            if (result && result.quotes && result.quotes.length > 0) {
               break
            }
            throw new Error('데이터가 비어있습니다.')
         } catch (error) {
            console.error(`재시도 ${retryCount + 1}/3:`, error.message)
            retryCount++
            if (retryCount === 3) throw error
            await new Promise((resolve) => setTimeout(resolve, 3000 * retryCount))
         }
      }

      console.log('Yahoo Finance API 응답:', {
         symbol,
         quotesLength: result?.quotes?.length,
         error: result?.error,
      })

      if (!result || !result.quotes || result.quotes.length === 0) {
         console.error('빈 데이터 응답:', { symbol, result })
         return res.status(404).json({ error: '차트 데이터를 찾을 수 없습니다.' })
      }

      // 데이터 포맷팅
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

      if (chartData.length === 0) {
         console.error('유효한 데이터 없음:', { symbol, originalLength: result.quotes.length })
         return res.status(404).json({ error: '유효한 차트 데이터가 없습니다.' })
      }

      // 캐시 저장
      chartCache.set(cacheKey, {
         timestamp: Date.now(),
         data: chartData,
      })

      console.log('차트 데이터 반환:', { symbol, dataLength: chartData.length })
      return res.json(chartData)
   } catch (error) {
      console.error('차트 데이터 조회 오류:', {
         symbol: req.params.symbol,
         error: error.message,
         stack: error.stack,
      })

      if (error.name === 'HTTPError' && error.response?.statusCode === 404) {
         return res.status(404).json({ error: '차트 데이터를 찾을 수 없습니다.' })
      }

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
      const quotes = await Promise.all(
         indices.map(async (symbol) => {
            try {
               return await yahooFinance.quote(symbol)
            } catch (error) {
               console.error(`${symbol} 시세 조회 오류:`, error)
               return null
            }
         })
      )

      const validQuotes = quotes.filter(Boolean)
      return res.json(validQuotes)
   } catch (error) {
      console.error('시장 개요 조회 오류:', error)
      return res.status(500).json({ error: '시장 개요 조회 중 오류가 발생했습니다.' })
   }
})

module.exports = router
