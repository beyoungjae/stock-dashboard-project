# stock-dashboard-project

사용자 세팅\
config.json 파일의\
\
"development": {\
"username": "root",\
"password": "mysql 사용자 비밀번호 입력",\
"database": "stock_dashboard",\
"host": "127.0.0.1",\
"dialect": "mysql"\
},\
"password" 부분만, 실제 사용중인 mysql의 비밀번호를 입력.\
\
mac의 경우 mysql 설치 시 초기 비밀번호를 8자리로 설정하기 때문입니다.\
\
[개선 및 추가가 필요한 부분]\
\
마이페이지(나의 대시보드)\
게시글 작성수, 댓글 작성 수, 좋아요 받은 횟수 카드 클릭 시 최근 활동 기록에 목록으로 각각 보여주기. < 개선 완료\
\
주식 상세페이지\
최신 뉴스 가져오도록 해서 상세페이지에 알맞게 뉴스 카드를 추가하기 (기업에 대한 정보 가져오기는 패스)\
\
게시판 + 인기 게시글 - 공간 많이 남는거 어떤걸로 채울지 생각하기..\
\
[추가 기능]\
주식 데이터 더욱 안정적으로 가져오며, 에러처리 개선\
회원가입 시 이메일, 비밀번호 확인 유효성 검사 기능 추가
