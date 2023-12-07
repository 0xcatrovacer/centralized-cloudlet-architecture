const getLowestDiskUsageClient = () => {
    let clients = global.clients;
    let lowUsageClients = [];
    
    Object.entries(clients).forEach(([key, client]) => {
        if (client.disk_load_status === "LOW") {
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
        console.log("Free clients not found");
        return;
    }

    const dataPacket = dataQueue[0];

    console.log("Transferring data", dataPacket.id, "to", client.id);

    socket.to(client.id).emit("node_data_transfer", dataPacket);

    global.queues.dataQueue = global.queues.dataQueue.filter((packet) => packet.id !== dataPacket.id);
}

module.exports = {
    transferDataPackets
}