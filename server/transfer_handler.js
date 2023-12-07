const getLowestDiskUsageClient = () => {
    let clients = global.clients;
    let lowUsageClients = [];
    
    Object.entries(clients).forEach(([key, client]) => {
        if (client.disk_load_status === "LOW" || client.disk_load_status === "MID") {
            lowUsageClients.push({id: key, ...client})
        }
    });
    
    lowUsageClients.sort((a, b) => a.disk_ratio - b.disk_ratio);
    
    return lowUsageClients[0];
}

const transferDataPackets = (socket) => {
    let clients = global.clients;
    let dataQueue = global.queues.dataQueue;

    if (Object.keys(clients).length <= 0) {
        console.log("No clients found");
        return;
    }

    if (dataQueue.length <= 0) {
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

    socket.to(client.id).emit("node_data_transfer", dataPacket);
    global.stats.data.packetsSentToNodes += 1;

    global.queues.dataQueue = global.queues.dataQueue.filter((packet) => packet.id !== dataPacket.id);
}

module.exports = {
    transferDataPackets
}