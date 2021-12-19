var express = require('express');
var http = require('http');

var app = express();
var bodyParser = require('body-parser');
var server = http.createServer(app);
var io = require('socket.io')(server);


var path = require('path');
var users = [];
var onlineUsers = [];
app.use(express.static(path.join(__dirname,'./public')));
app.use(bodyParser.urlencoded({ extended: true })); 


app.get('/', function(req,res) {  
   res.sendFile('index.html');  
});

app.post('/room', function(req,res) {
    var username = req.body.username;
    io.use((socket, next) => {  
        socket.username = username;  
        next()
        console.log('Implementing use')
    });
    res.redirect(`/room?username=${username}`);
});

app.get('/room', (req, res)=>{
    res.sendFile(__dirname + '/public/index-2.html');
 
});

app.get('/getOnlineUsers', (req, res)=>{
    
    res.json(onlineUsers);
 
});

io.on('connection', (socket) => {
    onlineUsers.push({userID:socket.id,username:socket.username})
    socket.broadcast.emit("user connected", {    
        userID: socket.id,    
        username: socket.username,  
    });
    // for (let [id, socket] of io.of("/").sockets) { 
    //     if(!users.indexOf(socket.id) > -1){
    //         users.push({      
    //             userID: id,      
    //             username: socket.username,    
    //         }); 
    //     }   
         
    // }  
    // socket.emit("users", users);

    socket.on("private-message", ({ message, to ,from}) => {
        socket.to(to).emit("private-message", {    
            message:message,    
            from: from
        });
    });

    socket.on('disconnect', () => {
        onlineUsers.forEach(user => {
            if(user.userID == socket.id){
                const index = onlineUsers.indexOf(user);
                onlineUsers.splice(index,1);
                socket.broadcast.emit("user disconnected", {    
                    userID: socket.id,    
                    username: socket.username,  
                });
                console.log("On Disconnect")
                console.log(user)
            }
        })
    })
    
    
    console.log('👾 New socket connected! >>', socket.id,socket.username)
    console.log("Getting online users")
    console.log(onlineUsers);
})


server.listen(3000, function() {  
   console.log('listening on *:3000');  
});  