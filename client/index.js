require("dotenv").config();
const io = require("socket.io-client");

const { sendStorageStatusUpdate } = require("./updates_handler");
const { handleDataTransfers, handleTaskTransfers } = require("./transfer_handler");

const SERVER = process.env.SERVER;
const PORT = process.env.PORT

const socket = io(`${SERVER}:${PORT}`);

global.thresholds = {
    threshold0_disk: parseFloat(process.env.THRESHOLD0_DISK),
    threshold1_disk: parseFloat(process.env.THRESHOLD1_DISK),
    threshold0_cpu: parseFloat(process.env.THRESHOLD0_CPU),
    threshold1_cpu: parseFloat(process.env.THRESHOLD1_CPU),
}

global.simulationEnv = process.env.SIMULATION_ENV

global.nodestats = {
    disk: {
        current_disk_load: parseInt(process.env.INITIAL_DISK_LOAD),
        disk_load_status: process.env.DISK_LOAD_STATUS,
        max_disk_load: parseInt(process.env.MAX_DISK_LOAD)
    },
    cpu: {
        current_cpu_load: parseInt(process.env.INITIAL_CPU_LOAD),
        cpu_load_status: process.env.CPU_LOAD_STATUS,
        max_cpu_load: parseInt(process.env.MAX_CPU_LOAD),
    },
    bandwidth: {
        current_bandwidth_load: 0,
        current_bandwidth_status: "LOW",
    }
}

global.transferstats = {
    dataPacketsReceived: 0,
    tasksReceived: 0,
}

socket.on("connect", () => {
    console.log("Connected to Manager", socket.id);
    sendStorageStatusUpdate(socket);
});

socket.on("node_data_transfer", (data) => {
    handleDataTransfers(data, socket);
})

socket.on("node_task_transfer", (data) => {
    handleTaskTransfers(data, socket);
})

setInterval(() => {
    sendStorageStatusUpdate(socket);
}, process.env.STORAGE_UPDATE_INTERVAL);