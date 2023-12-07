const handleDataTransfers = (data) => {
    console.log("Received data packet", data.id, "of size", data.size);
    global.nodestats.disk.current_disk_load += data.size;
}

module.exports = {
    handleDataTransfers
}