require("dotenv").config();
const io = require("socket.io-client");

const SERVER = process.env.SERVER;
const PORT = process.env.PORT

const socket = io(`${SERVER}:${PORT}`);

socket.on("connect", () => {
    console.log("Connected to Manager", socket.id);
});