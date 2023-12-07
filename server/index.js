require("dotenv").config();
const { Server } = require("socket.io");
const { transferDataPackets } = require("./transfer_handler");

const PORT = process.env.PORT;

const io = new Server(PORT);

global.clients = {};

global.queues = {
    dataQueue: [],
    taskQueue: []
};

global.stats = {
    data: {
        packetsReceivedFromEndDevice: 0,
        packetsSentToNodes: 0,
        packetsTransferredToCloud: 0
    },
    cpu: {
        tasksReceivedFromEndDevice: 0,
        tasksSentToNodes: 0,
        tasksTransferredToCloud: 0
    }
}

io.on("connection", (socket) => {
    console.log("Node", socket.id, "connected to Manager");

    socket.on("end_device_data_transfer", (data) => {
        console.log("Received data packet", data.id, "of size", data.size, "from end device");
        global.queues.dataQueue.push(data);
    })

    socket.on("end_device_task_transfer", (data) => {
        console.log("Received task", data.id ," of datasize", data.size, "with execution load", data.execution_load);
        global.queues.taskQueue.push(data);
    })

    socket.on("disk_info", (data) => {
        global.clients[socket.id] = {
            disk_ratio: data.disk_ratio,
            disk_load_status: data.disk_load_status,
            cpu_ratio: data.cpu_ratio,
            cpu_load_status: data.cpu_load_status,
            bandwidth_load_status: data.bandwidth_load_status,
        }
    });

    socket.on("cpu_info", (data) => {
        global.clients[socket.id] = {
            disk_ratio: data.disk_ratio,
            disk_load_status: data.disk_load_status,
            cpu_ratio: data.cpu_ratio,
            cpu_load_status: data.cpu_load_status,
            bandwidth_load_status: data.bandwidth_load_status,
        }
    });

    socket.on("data_received_acknowledge", (data) => {
        if (data.received) {
            console.log(`Received acknowledgement for ${data.data.id}`);
            
            global.stats.data.packetsSentToNodes += 1;
        } else {
            global.queues.dataQueue.push(data.data);
        }
    })

    setInterval(() => {
        transferDataPackets(io);
    }, process.env.PACKET_TRANSFER_INTERVAL);
});


io.on("connection_error", (error) => {
  console.log(`Connection Error: ${error.message}`);
});

setTimeout(() => {
    if (global.queues.dataQueue.length > 0) {
        global.stats.data.packetsTransferredToCloud += global.queues.dataQueue.length;
    }

    global.stats.data.packetsReceivedFromEndDevice = global.stats.data.packetsTransferredToCloud + global.stats.data.packetsSentToNodes;

    console.log(global.stats);
    io.close();
    process.exit();
}, 60 * 1000);