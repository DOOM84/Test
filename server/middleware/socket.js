import { Server } from 'socket.io';
//import DB from "~/db/database";

//const db = new DB();

let server = null

export default defineEventHandler(async (event) => {

    if (!server) {
        // @ts-expect-error: Nuxt3
        server = event.res.socket?.server
        const io = new Server(server);

        io.on("connection", function (socket) {

            //console.log("A user with ID: " + socket.id + " connected");

            socket.on("disconnect", function () {
                //console.log("A user with ID: " + socket.id + " disconnected");
                //io.emit("connections", io.engine.clientsCount);
            });

            socket.on("connect_error", (err) => {
                console.log(`connect_error due to ${err.message}`);
            });

            // More Socket listening here.

            //io.emit("connections", io.engine.clientsCount);

            socket.on("result-added", async (result) => {
                socket.broadcast.emit("add-result", result);
            });


        });

    }

})