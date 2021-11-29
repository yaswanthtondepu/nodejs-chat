var express = require("express");
var app = express();

var http = require("http").createServer(app);
var users = [];
const cors = require("cors");
var mysql = require("mysql");
app.use(cors());
const { Server } = require("socket.io");
app.use(function (request, result, next) {
	result.setHeader("Access-Control-Allow-Origin", "*");
	next();
});
var port = process.env.PORT || 8081;

app.listen(port);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// app.post("/get_messages", function (request, result) {
// 	connection.query("SELECT * from chat where " + request.body.fromUserId + " in (fromUserId, toUserId) and " + request.body.toUserId + " in (fromUserId, toUserId) order by sentTime ASC", function (error, messages) {
// 		result.end(JSON.stringify(messages));
// 	});
// });
var connection = mysql.createConnection({
	"host": "utacloud2",
	"user": "vxt9613_admin",
	"password": "lunamarmanagement",
	"database": "vxt9613_lunamarManagement",
});

connection.connect(function (error) {
	console.log(error);
});

const io = new Server(http, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	}
})

io.on("connection", function (socket) {
	console.log("User connected", socket.id);

	socket.on("user_connected", function (userId) {
		users[userId] = socket.id;

		io.emit("user_connected", userId);
	});

	socket.on("send_message", function (data) {
		console.log(data);
		var socketId = users[data.toUserId];


		connection.query("INSERT INTO chat (fromUserId,toUserId,message,sentTime) VALUES (" + data.fromUserId + " , " + data.toUserId + ", '" + data.message + "' , '" + data.sentTime + "')", function (error, result) {
			io.to(socketId).emit("new_message", data);
		});
	});
})
http.listen(8081, function () {
	console.log("Server Started");
})