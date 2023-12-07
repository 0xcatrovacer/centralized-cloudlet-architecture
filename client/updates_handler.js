const getLoadRatios = () => {
    const disk_load = global.nodestats.disk.current_disk_load;
    const max_disk_load = global.nodestats.disk.max_disk_load;

    const cpu_load = global.nodestats.cpu.current_cpu_load;
    const max_cpu_load = global.nodestats.cpu.max_cpu_load;

    const disk_ratio = disk_load / max_disk_load;
    const cpu_ratio = cpu_load / max_cpu_load;

    return { disk_ratio, cpu_ratio }
}

const sendStorageStatusUpdate = (socket) => {
    if (!socket.id) {
        return;
    }

    let { disk_ratio, cpu_ratio } = getLoadRatios();

    let threshold0_disk = global.thresholds.threshold0_disk;
    let threshold1_disk = global.thresholds.threshold1_disk;
    let threshold0_cpu = global.thresholds.threshold0_cpu;
    let threshold1_cpu = global.thresholds.threshold1_cpu;

    let disk_load_status;
    let cpu_load_status;
    let bandwidth_load_status;

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

    let current_bandwidth_load = global.nodestats.bandwidth.current_bandwidth_load;

    if (current_bandwidth_load <= 0) {
        bandwidth_load_status = "LOW";
    } else if (current_bandwidth_load <= 1) {
        bandwidth_load_status = "MID";
    } else {
        bandwidth_load_status = "HIG";
    }
    
    global.nodestats.bandwidth.current_bandwidth_status = bandwidth_load_status;

    const storageInfo = {
        disk_ratio,
        disk_load_status,
        cpu_ratio,
        cpu_load_status,
        bandwidth_load_status,
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

module.exports = {
    sendStorageStatusUpdate
}