/* 
 테마 설정
 테마 설정은 컴포넌트에서 사용하는 색상, 폰트, 간격, 그림자, 애니메이션 등을 정의

 각각의 테마 설정 예시 : 
 1. 색상 : 주요 색상 팔레트를 정의하여 컴포넌트에서 사용
 2. 간격 : 컴포넌트에서 사용하는 간격을 정의하여 컴포넌트에서 사용
 3. 그림자 : 컴포넌트에서 사용하는 그림자를 정의하여 컴포넌트에서 사용
 4. 애니메이션 : 컴포넌트에서 사용하는 애니메이션을 정의하여 컴포넌트에서 사용
 5. 폰트 : 컴포넌트에서 사용하는 폰트를 정의하여 컴포넌트에서 사용

 왜 이렇게 사용하냐?
 > 미리 테마를 정의해두면 컴포넌트에서 디자인 일관성을 유지하여 사용하고 싶을 때 테마를 적용하기 쉽다.

 스타일 컴포넌트에서 적용 예시 :
  const Container = styled.div`
    background: ${({ theme }) => theme.colors.background};
    padding: ${({ theme }) => theme.spacing.xl};
  `

${({ theme }) => theme.colors.background} 는 테마 설정에서 정의한 색상을 사용하는 것
${({ theme }) => theme.spacing.xl} 는 테마 설정에서 정의한 간격을 사용하는 것
*/
const Theme = {
   colors: {
      // 색상 팔레트
      primary: '#00D09C',
      secondary: '#7B61FF',
      background: '#121212',
      surface: '#1E1E1E',
      surfaceLight: '#2D2D2D',
      text: '#FFFFFF',
      textSecondary: '#A0A0A0',
      border: '#333333',
      error: '#FF5252',
      success: '#00C853',
      chart: {
         up: '#00C853',
         down: '#FF5252',
         volume: '#4A4A4A',
      },
   },
   spacing: {
      // 간격
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
   },
   borderRadius: {
      // 라운드 값
      small: '4px',
      medium: '8px',
      large: '12px',
   },
   shadows: {
      // 그림자 값
      small: '0 2px 4px rgba(0, 0, 0, 0.2)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.3)',
      large: '0 8px 16px rgba(0, 0, 0, 0.4)',
      glow: '0 0 8px rgba(0, 208, 156, 0.3)',
      neon: '0 0 12px',
   },
   transitions: {
      // 애니메이션 값
      quick: 'all 0.2s ease',
      normal: 'all 0.3s ease',
      slow: 'all 0.5s ease',
   },
   typography: {
      // 폰트 값
      fontSizes: {
         // 폰트 크기
         xs: '0.75rem',
         sm: '0.875rem',
         md: '1rem',
         lg: '1.25rem',
         xl: '1.5rem',
         xxl: '2rem',
         xxxl: '3rem',
      },
      fontWeights: {
         // 폰트 두께
         normal: 400,
         medium: 500,
         semibold: 600,
         bold: 700,
      },
   },
}

export default Theme
