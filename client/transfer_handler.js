const handleDataTransfers = (data, socket) => {
    console.log("Received data packet", data.id, "of size", data.size);
    global.nodestats.bandwidth.current_bandwidth_load += 1;
    
    global.nodestats.disk.current_disk_load += data.size;
    global.transferstats.dataPacketsReceived += 1;
    
    console.log({
        current_disk_load: global.nodestats.disk.current_disk_load,
        current_disk_status: global.nodestats.disk.disk_load_status,
        current_bandwidth_load: global.nodestats.bandwidth.current_bandwidth_load,
        bandwidth_load_status: global.nodestats.bandwidth.current_bandwidth_status,
        total_packets_received: global.transferstats.dataPacketsReceived
    })
    
    let ack = {
        received: true,
        data: data
    }
    
    socket.emit("data_received_acknowledge", ack);
    global.nodestats.bandwidth.current_bandwidth_load -= 1;
}

const handleTaskTransfers = (data, socket) => {
    console.log("Received task", data.id, "of size", data.size, "and execution load", data.execution_load,"% with execution time", data.execution_time,"ms");
    global.nodestats.bandwidth.current_bandwidth_load += 1;

    global.nodestats.disk.current_disk_load += data.size;
    global.nodestats.cpu.current_cpu_load += data.execution_load;
    global.transferstats.tasksReceived += 1;

    console.log({
        current_disk_load: global.nodestats.disk.current_disk_load,
        current_disk_status: global.nodestats.disk.disk_load_status,
        current_cpu_load: global.nodestats.cpu.current_cpu_load,
        current_cpu_status: global.nodestats.cpu.cpu_load_status,
        current_bandwidth_load: global.nodestats.bandwidth.current_bandwidth_load,
        bandwidth_load_status: global.nodestats.bandwidth.current_bandwidth_status,
        total_tasks_received: global.transferstats.tasksReceived
    })

    let ack = {
        received: true,
        data: data
    }

    setTimeout(() => {
        socket.emit("task_received_acknowledge", ack);
        global.nodestats.bandwidth.current_bandwidth_load -= 1;
        global.nodestats.cpu.current_cpu_load -= data.execution_load;
    }, data.execution_time);
}

module.exports = {
    handleDataTransfers,
    handleTaskTransfers
}