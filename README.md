# BillionaireGuns

1. In case you download the project from GitHub:
   - Create .env file with contents:
	DB_URL = "mongodb://localhost:27017/webgameproject"
	SESSION_SECRET = "webgame"

2. You name "webgameproject" for the name of database
3. The name of collection in database is "users" 
4. To download full of package, run "npm install"
5. To run the project, run "npm start"
6. Our web project is run on port 3000. If you want to run our project on 2 or more different devices, you have to
host 2 port: 3000 for NodeJs and 8900 for Socketio
7. In src/pages/game/scripts/const.js, you change the variableS "NODEJS_URL" and "SOCKET_URL" according to the links you host for 2 ports.
--- We use "ngrok" in order to host 2 ports, if you use other programs, you have to find the way to run the project by yourself ---
--- We are sorry for this inconvenience :((( ---   
