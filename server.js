const content = require('fs').readFileSync(__dirname + '/index.html', 'utf8');
const server = require('http').createServer((req, res) => {
    // serve the index.html file
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Length', Buffer.byteLength(content));
    res.end(content);
});

const Drone = require('./drone.config');

const io = require('socket.io')(server);
const port = process.env.PORT || 8080;

io.use((socket, next) => {
    const dataquery = socket.handshake.query;
    if(dataquery.pin === Drone.pin && dataquery.droneId === Drone.droneId){
        return next();
    } else return next(new Error('Invalid Pin'))
});

io.on('connect', socket => {
    console.log("socket : " + socket.id + " is connected");
    //Connect To Room
    socket.on('join',(droneName)=>{
        socket.join(Drone.room, ()=>{
            console.log("socket : " + socket.id + " is joined to " + Object.keys(socket.rooms))
            io.to(socket.id).emit('joined', 'I have joined ' + Object.keys(socket.rooms));
        })
    })

    socket.on('status-info', (status) => {
        console.log('received drone status-info from socket : ' + socket.id)
        console.log(status)
        socket.to(Drone.room).emit('status-info', status)
    })

    socket.on('command-info', (status) => {
        console.log('received drone command-info from socket : ' + socket.id)
        console.log(status)
        socket.to(Drone.room).emit('command-info', status)
    })

    socket.on('mission-info', (status) => {
        console.log('received drone mission-info from socket : ' + socket.id)
        console.log(status)
        socket.to(Drone.room).emit('mission-info', status)
    })

    socket.on('mission', (data) => {
        console.log(data)
        console.log('received mission from user : ' + socket.id)
        socket.to(Drone.room).emit('missioned', data)
    })

    socket.on('command', (data) => {
        console.log(data)
        console.log('received command from user : ' + socket.id)
        socket.to(Drone.room).emit('commanded', data)
    })

    socket.on('leave', droneName=>{
        socket.leave(Drone.room, ()=>{
            console.log('receive leave event from socket : ' + socket.id)
            io.to(socket.id).emit('left', 'I have left rooms ' + Drone.room)
        })
    })

    socket.on('disconnect', ()=>{
        console.log(socket.id + " Disconnected")
    })
})

server.listen(port, function () {
    console.log("server listen to port " + port);
});