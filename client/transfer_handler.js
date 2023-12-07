const handleDataTransfers = (data, socket) => {
    console.log("Received data packet", data.id, "of size", data.size);
    
    global.nodestats.disk.current_disk_load += data.size;
    global.transferstats.dataPacketsReceived += 1;

    console.log({
        current_disk_load: global.nodestats.disk.current_disk_load,
        current_disk_status: global.nodestats.disk.disk_load_status,
        total_packets_received: global.transferstats.dataPacketsReceived
    })

    let ack = {
        received: true,
        data: data
    }

    socket.emit("data_received_acknowledge", ack);
}

module.exports = {
    handleDataTransfers
}