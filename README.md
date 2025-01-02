# stock-dashboard-project

[데이터 베이스 세팅]\
CREATE DATABASE stock_dashboard DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;\
\
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
주식 상세페이지\
최신 뉴스 가져오도록 해서 상세페이지에 알맞게 뉴스 카드를 추가하기 (기업에 대한 정보 가져오기는 패스)
