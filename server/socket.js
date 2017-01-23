const chalk = require('chalk');
const users = require('./users');

module.exports = io => {

  io.on('connection', socket => {
    console.log(chalk.yellow('You made a new friend, how cute'));
    console.log(chalk.yellow(`${socket.id} has connected`));

    // Possible todo: create rooms/namespaces

    const id = socket.id;
    users.createUser(id);
    const user = users.userFromId(id);

    // This goes to the user that just connected, I think
    socket.emit('createUser', user);
    // This goes to the users who are already connected
    socket.broadcast.emit('newUser', user);

    // This will send all of the current users to the user that just connected
    socket.on('getOthers', () => {
      socket.emit('getOthersCallback', users.getOtherUsers(id));
    });

    socket.on('haveGottenOthers', () => {
      socket.emit('startTick');
    });

    socket.on('readyToReceiveUpdates', () => {
      socket.emit('startTheInterval');
    });

    // This will update a user's position when they move, and send it to everyone
    // except the specific scene's user
    socket.on('tick', userData => {
      users.updatePosition(userData);
    });

    // This will send an array of users except for the specific scene's user
    // Used to update position and rotation every x interval, as specified by the front-end
    socket.on('getUpdate', () => {
      socket.emit('usersUpdated', users.getOtherUsers(id));
    });

    socket.on('disconnect', () => {
      console.log(chalk.magenta(`${socket.id} has disconnected (╥﹏╥)`));
      socket.broadcast.emit('removeUser', users.removeUser(id));
    });

  });

};
