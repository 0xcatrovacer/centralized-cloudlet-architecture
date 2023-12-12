require("dotenv").config();
const io = require("socket.io-client");
const uuid = require('uuid');

const SERVER = process.env.SERVER;
const PORT = process.env.PORT
const sim_env = process.env.SIMULATION_ENV;

const socket = io(`${SERVER}:${PORT}`);

const transferData = () => {
    socket.emit("end_device_data_transfer", {
        id: uuid.v4(),
        size: parseInt(process.env.DATA_PACKET_SIZE),
    })
}

const transferTask = () => {
    let max = 8;
    let min = 1;
    
    let execution_load = Math.floor(Math.random() * ((max - min) + 1) + min) * 10;
    let execution_time = execution_load;
    
    socket.emit("end_device_task_transfer", {
        id: uuid.v4(),
        size: parseInt(process.env.DATA_PACKET_SIZE),
        execution_load: execution_load,
        execution_time: execution_time,
    })
}

const transferPackets = () => {
    if (sim_env === "DATA") {
        transferData();
    } else if (sim_env === "TASK") {
        transferTask();
    } else if (sim_env === "DATAnTASK") {
        transferData();
        transferTask();
    }
}

socket.on("connect", () => {
    console.log("Connected to Manager", socket.id);
});

setInterval(() => {
    transferPackets();
}, process.env.PACKET_TRANSFER_INTERVAL)