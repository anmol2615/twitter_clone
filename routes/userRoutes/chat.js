/**
 * Created by anmol on 2/22/16.
 */
//------------------------------------------------------



var chat = io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('chat message',function(msg){
        io.emit('chat message',msg);
    });
});
module.exports = [
    chat
]
