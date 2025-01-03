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
[참고 사항]\
\
주식 데이터의 경우 yahoo finance API를 사용하여 가져옵니다.\
yahoo finance API는 무료 사용 제한이 있으며, 사용 중 가끔 서버 오류가 발생할 수 있습니다.
