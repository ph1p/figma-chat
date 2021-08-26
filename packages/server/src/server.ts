import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const VERSION = process.env.VERSION || process.env.NODE_ENV;
const PORT = process.env.PORT || 3000;

app.get('/', (_, res) => {
  res.send({
    name: 'figma-chat',
    version: VERSION,
  });
});

const createUser = (id = '', name = '', color = '', room = '') => ({
  id,
  name,
  color,
  room,
});

declare class UserSocket extends Socket {
  user: any;
}

io.on('connection', (socket) => {
  const sock = socket as unknown as UserSocket;
  if (!sock.user) {
    sock.user = createUser(socket.id);
  }

  const sendOnline = async (room = '') => {
    try {
      let userRoom = room;

      if (sock?.user?.room) {
        userRoom = sock.user.room;
      }

      if (userRoom) {
        const sockets = await io.of('/').in(userRoom).allSockets();
        const users = Array.from(sockets)
          .map((id) => io.of('/').sockets.get(id))
          .filter(Boolean)
          .map((s: any) => s.user);

        io.in(userRoom).emit('online', users);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const joinLeave = async (currentSocket: any, type = 'JOIN') => {
    currentSocket.broadcast
      .to(currentSocket.user.room)
      .emit('join leave message', {
        id: currentSocket.id,
        user: currentSocket.user,
        type,
      });
  };

  socket.on('chat message', ({ roomName, message }) => {
    if (roomName) {
      if (!sock.user.room) {
        sock.user.room = roomName;
        sock.join(roomName);
        sendOnline(roomName);
      }

      // send to all in room except sender
      sock.broadcast.to(roomName).emit('chat message', {
        id: sock.id,
        user: sock.user,
        message,
      });
    }
  });

  const joinRoom = ({ room, settings }: any) => {
    sock.join(room);

    sock.user = {
      ...sock.user,
      ...settings,
      room,
    };

    joinLeave(sock);
    sendOnline(room);
  };

  socket.on('login', ({ room, settings }) => {
    if (io.sockets.adapter.rooms.has(room)) {
      joinRoom({
        room,
        settings,
      });

      sock.emit('login succeeded');
    } else {
      sock.emit('login failed');
    }
  });

  sock.on('set user', (userOptions) => {
    sock.user = {
      ...sock.user,
      ...userOptions,
    };

    sendOnline();
  });

  sock.on('reconnect', () => {
    sendOnline();

    sock.emit('user reconnected');
  });

  sock.on('join room', joinRoom);

  sock.on('disconnect', () => {
    joinLeave(sock, 'LEAVE');
    sock.leave(sock.user.room);

    sendOnline(sock.user.room);
  });
});

httpServer.listen(PORT, () => {
  console.log(`The Figma-Chat Server (${VERSION}) is running`);
});

process.on('SIGINT', () => {
  process.exit();
});
