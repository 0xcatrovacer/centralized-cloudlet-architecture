const handleDataTransfers = (data) => {
    console.log("Received data packet", data.id, "of size", data.size);
    global.nodestats.disk.current_disk_load += data.size;
    console.log({
        current_disk_load: global.nodestats.disk.current_disk_load,
        current_disk_status: global.nodestats.disk.disk_load_status
    })
}

module.exports = {
    handleDataTransfers
}