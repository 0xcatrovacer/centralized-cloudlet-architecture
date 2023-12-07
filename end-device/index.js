require("dotenv").config();
const io = require("socket.io-client");
const uuid = require('uuid');

const SERVER = process.env.SERVER;
const PORT = process.env.PORT
const sim_env = process.env.SIMULATION_ENV;

const socket = io(`${SERVER}:${PORT}`);

const transferPackets = () => {
    if (sim_env === "DATA") {
        socket.emit("end_device_data_transfer", {
            id: uuid.v4(),
            size: parseInt(process.env.DATA_PACKET_SIZE),
        })
    } else if (sim_env === "TASK") {
        let max = 15;
        let min = 5;
        
        let execution_time = Math.floor(Math.random() * ((max - min) + 1) + min);

        socket.emit("end_device_task_transfer", {
            id: uuid.v4(),
            size: parseInt(process.env.DATA_PACKET_SIZE),
            execution_load: parseInt(process.env.TASK_EXECUTION_LOAD),
            execution_time
        })
    }
}

socket.on("connect", () => {
    console.log("Connected to Manager", socket.id);
});

setInterval(() => {
    transferPackets();
}, process.env.PACKET_TRANSFER_INTERVAL)