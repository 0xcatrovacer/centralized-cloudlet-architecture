require("dotenv").config();
const io = require("socket.io-client");

global.thresholds = {
    threshold0_disk: process.env.THRESHOLD0_DISK,
    threshold1_disk: process.env.THRESHOLD1_DISK,
    threshold0_cpu: process.env.THRESHOLD0_CPU,
    threshold1_cpu: process.env.THRESHOLD1_CPU,
}

global.simulationEnv = process.env.SIMULATION_ENV

global.nodestats = {
    disk: {
        current_disk_load: process.env.INITIAL_DISK_LOAD,
        max_disk_load: process.env.MAX_DISK_LOAD
    },
    task: {
        current_cpu_load: process.env.INITIAL_CPU_LOAD,
        max_cpu_load: process.env.MAX_CPU_LOAD,
    },
    bandwidth: {
        current_bandwidth_load: 0,
        current_bandwidth_status: "LOW",
        max_bandwidth_load: process.env.MAX_BANDWIDTH_LOAD,
    }
}

const SERVER = process.env.SERVER;
const PORT = process.env.PORT

const socket = io(`${SERVER}:${PORT}`);

socket.on("connect", () => {
    console.log("Connected to Manager", socket.id);
});