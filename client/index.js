require("dotenv").config();
const io = require("socket.io-client");

const SERVER = process.env.SERVER;
const PORT = process.env.PORT

const socket = io(`${SERVER}:${PORT}`);

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
        disk_load_status: process.env.DISK_LOAD_STATUS,
        max_disk_load: process.env.MAX_DISK_LOAD
    },
    cpu: {
        current_cpu_load: process.env.INITIAL_CPU_LOAD,
        cpu_load_status: process.env.CPU_LOAD_STATUS,
        max_cpu_load: process.env.MAX_CPU_LOAD,
    },
    bandwidth: {
        current_bandwidth_load: 0,
        current_bandwidth_status: "LOW",
        max_bandwidth_load: process.env.MAX_BANDWIDTH_LOAD,
    }
}

const getLoadRatios = () => {
    const disk_load = global.nodestats.disk.current_disk_load;
    const max_disk_load = global.nodestats.disk.max_disk_load;

    const cpu_load = global.nodestats.cpu.current_cpu_load;
    const max_cpu_load = global.nodestats.cpu.max_cpu_load;

    const disk_ratio = disk_load / max_disk_load;
    const cpu_ratio = cpu_load / max_cpu_load;

    return { disk_ratio, cpu_ratio }
}

const sendStorageStatusUpdate = () => {
    let { disk_ratio, cpu_ratio } = getLoadRatios();

    let threshold0_disk = global.thresholds.threshold0_disk;
    let threshold1_disk = global.thresholds.threshold1_disk;
    let threshold0_cpu = global.thresholds.threshold0_cpu;
    let threshold1_cpu = global.thresholds.threshold1_cpu;

    if (disk_ratio <= threshold0_disk) {
        disk_load_status = 'LOW';
    } else if (threshold0_disk < disk_ratio && disk_ratio <= threshold1_disk) {
        disk_load_status = 'MID';
    } else {
        disk_load_status = 'HIG';
    }

    global.nodestats.disk.disk_load_status = disk_load_status;

    if (cpu_ratio <= threshold0_cpu) {
        cpu_load_status = 'LOW';
    } else if (threshold0_cpu < cpu_ratio && cpu_ratio <= threshold1_cpu) {
        cpu_load_status = 'MID';
    } else {
        cpu_load_status = 'HIG';
    }

    global.nodestats.cpu.cpu_load_status = cpu_load_status;

    const storageInfo = {
        disk_ratio,
        disk_load_status,
        cpu_ratio,
        cpu_load_status,
    }

    if (global.simulationEnv === "DATA") {
        socket.emit('disk_info', {
            ...storageInfo,
        })
    } else if (global.simulationEnv === "TASK") {
        socket.emit('cpu_info', {
            ...storageInfo,
        })
    }
}

socket.on("connect", () => {
    console.log("Connected to Manager", socket.id);
    sendStorageStatusUpdate();
});