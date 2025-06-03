const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

const users = {}; // { socketId: { nickname, sex, province, currentRoom } }
const nicknames = new Set(); // Para mantener un registro de nicknames únicos

// **********************************************************
// ***** NUEVA FUNCIÓN AUXILIAR *****
// **********************************************************
// Helper function to get nicknames of users in a specific room (province)
function getUsersInRoom(provinceId) {
    const usersInRoom = [];
    for (const socketId in users) {
        if (users[socketId].province === provinceId) {
            usersInRoom.push(users[socketId].nickname);
        }
    }
    return usersInRoom;
}
// **********************************************************
// ***** FIN NUEVA FUNCIÓN AUXILIAR *****
// **********************************************************


io.on('connection', (socket) => {
    console.log(`[SERVER] Usuario conectado: ${socket.id}`);

    const { nickname: newNickname, sex: newSex, province: newProvince } = socket.handshake.query;

    if (!newNickname || !newSex || !newProvince) {
        console.log(`[SERVER] Conexión rechazada: Datos de usuario incompletos para socket ${socket.id}. Query: ${JSON.stringify(socket.handshake.query)}`);
        socket.emit('nickname in use', 'Error de conexión: Información de usuario incompleta. Recarga la página.');
        socket.disconnect(true); // Desconectar inmediatamente
        return;
    }

    if (nicknames.has(newNickname)) {
        console.log(`[SERVER] Conexión rechazada: Nickname '${newNickname}' ya en uso para socket ${socket.id}`);
        socket.emit('nickname in use', `El nickname '${newNickname}' ya está en uso.`);
        socket.disconnect(true); // Desconectar inmediatamente
        return;
    }

    // Si todo está bien, registrar al usuario
    nicknames.add(newNickname);
    users[socket.id] = {
        nickname: newNickname,
        sex: newSex,
        province: newProvince,
        currentRoom: newProvince // Por defecto, la sala de su provincia
    };
    socket.join(newProvince);
    console.log(`[SERVER] ${newNickname} (${socket.id}) se unió a la sala ${newProvince} y está activo.`);

    // Informar al cliente que su información fue aceptada y se unió
    socket.emit('info accepted');

    // **********************************************************
    // ***** CAMBIO CRUCIAL AQUÍ: EMITIR A LA SALA ESPECÍFICA *****
    // **********************************************************
    const usersInThisProvince = getUsersInRoom(newProvince);
    io.to(newProvince).emit('user list', usersInThisProvince);
    io.to(newProvince).emit('status message', `${newNickname} ha entrado al chat de ${newProvince}.`); // Mensaje de estado también por sala
    // **********************************************************
    // ***** FIN CAMBIO CRUCIAL *****
    // **********************************************************


    socket.on('chat message', (msg) => {
        const user = users[socket.id];
        if (user && msg.room) {
            io.to(msg.room).emit('chat message', {
                sender: user.nickname,
                text: msg.text,
                timestamp: msg.timestamp,
                room: msg.room
            });
            console.log(`[SERVER] Mensaje de sala '${msg.room}' de ${user.nickname}: ${msg.text}`);
        } else {
            console.warn(`[SERVER] Mensaje de chat recibido sin usuario o sala válidos: ${JSON.stringify(msg)}`);
        }
    });

    socket.on('private message', ({ to, msg }) => {
        const senderUser = users[socket.id];
        if (!senderUser) {
            console.warn(`[SERVER] Mensaje privado de un socket sin usuario registrado: ${socket.id}`);
            return;
        }

        let recipientSocketId = null;
        for (const id in users) {
            if (users[id].nickname === to) {
                recipientSocketId = id;
                break;
            }
        }

        if (recipientSocketId) {
            // Emitir al receptor
            io.to(recipientSocketId).emit('private message', {
                from: senderUser.nickname,
                to: to,
                text: msg.text,
                timestamp: msg.timestamp
            });
            // Emitir de vuelta al remitente para que vea su propio mensaje
            socket.emit('private message', {
                from: senderUser.nickname,
                to: to,
                text: msg.text,
                timestamp: msg.timestamp
            });
            console.log(`[SERVER] Mensaje privado de ${senderUser.nickname} a ${to}: ${msg.text}`);
        } else {
            socket.emit('status message', `El usuario ${to} no está online o no existe.`);
            console.log(`[SERVER] Intento de mensaje privado a usuario no encontrado: ${to}`);
        }
    });

    socket.on('disconnect', (reason) => {
        const user = users[socket.id];
        if (user) {
            console.log(`[SERVER] Usuario desconectado: ${user.nickname} (${socket.id}). Razón: ${reason}`);
            const disconnectedUserProvince = user.province; // Guardar la provincia antes de borrar el usuario

            nicknames.delete(user.nickname);
            delete users[socket.id];

            // **********************************************************
            // ***** CAMBIO CRUCIAL AQUÍ: EMITIR A LA SALA ESPECÍFICA *****
            // **********************************************************
            const remainingUsersInProvince = getUsersInRoom(disconnectedUserProvince);
            io.to(disconnectedUserProvince).emit('user list', remainingUsersInProvince);
            io.to(disconnectedUserProvince).emit('status message', `${user.nickname} ha abandonado el chat de ${disconnectedUserProvince}.`); // Mensaje de estado también por sala
            // **********************************************************
            // ***** FIN CAMBIO CRUCIAL *****
            // **********************************************************
        } else {
            console.log(`[SERVER] Socket desconectado sin usuario registrado: ${socket.id}. Razón: ${reason}`);
        }
    });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Servidor de chat corriendo en el puerto ${PORT}`));