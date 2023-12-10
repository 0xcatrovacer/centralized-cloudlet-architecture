const getLowestDiskUsageClient = () => {
    let clients = global.clients;
    let lowUsageClients = [];
    
    Object.entries(clients).forEach(([key, client]) => {
        if (
            (client.disk_load_status === "LOW" || client.disk_load_status == "MID") && 
            (client.bandwidth_load_status === "LOW" ||  client.bandwidth_load_status === "MID")) {
            lowUsageClients.push({id: key, ...client})
        }
    });
    
    lowUsageClients.sort((a, b) => a.disk_ratio - b.disk_ratio);
    
    return lowUsageClients[0];
}

const transferDataPackets = (io) => {
    let clients = global.clients;
    let dataQueue = global.queues.dataQueue;

    if (dataQueue.length <= 0) {
        return;
    }

    if (Object.keys(clients).length <= 0) {
        console.log("No connected clients found. Transferring packet to cloud.");

        global.stats.data.packetsTransferredToCloud += 1;
        global.queues.dataQueue.shift();

        return;
    }

    const client = getLowestDiskUsageClient();

    if (!client) {
        console.log("No free clients found. Transferring packet to cloud.");

        global.stats.data.packetsTransferredToCloud += 1;
        global.queues.dataQueue.shift();

        return;
    }

    const dataPacket = dataQueue[0];

    console.log("Transferring data", dataPacket.id, "to", client.id);

    io.to(client.id).emit("node_data_transfer", dataPacket);
    global.queues.dataQueue.shift();
}

const getLowestCpuUsageClient = (execution_load) => {
    let clients = global.clients;
    let lowUsageClients = [];
    
    Object.entries(clients).forEach(([key, client]) => {
        if (
            (client.cpu_load_status === "LOW" || client.cpu_load_status == "MID") && 
            (client.disk_load_status === "LOW" || client.disk_load_status == "MID") && 
            (client.bandwidth_load_status === "LOW" ||  client.bandwidth_load_status === "MID") &&
            (client.cpu_ratio * 100 + execution_load <= 90)) {
            lowUsageClients.push({id: key, ...client})
        }
    });
    
    lowUsageClients.sort((a, b) => a.disk_ratio - b.disk_ratio);
    
    return lowUsageClients[0];
}

const transferTasks = (io) => {
    let clients = global.clients;
    let taskQueue = global.queues.taskQueue;

    if (taskQueue.length <= 0) {
        return;
    }

    if (Object.keys(clients).length <= 0) {
        console.log("No connected clients found. Transferring task to cloud.");

        global.stats.task.tasksTransferredToCloud += 1;
        global.queues.taskQueue.shift();

        return;
    }

    const task = taskQueue[0];

    const client = getLowestCpuUsageClient(task.execution_load);

    if (!client) {
        console.log("No free clients found. Transferring task to cloud.");

        global.stats.task.tasksTransferredToCloud += 1;
        global.queues.taskQueue.shift();

        return;
    }

    console.log("Transferring task", task.id, "to", client.id);

    io.to(client.id).emit("node_task_transfer", task);
    global.queues.taskQueue.shift();
}

module.exports = {
    transferDataPackets,
    transferTasks
}