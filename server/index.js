require("dotenv").config();
const { Server } = require("socket.io");

const PORT = process.env.PORT

const io = new Server(PORT);

global.clients = {};

global.queues = {
    dataQueue: [],
    taskQueue: []
};

global.stats = {
    data: {
        packetsSentToNodes: 0,
        packetsRetainedByNodes: 0,
        packetsTransferredToCloud: 0
    },
    task: {
        tasksSentToNodes: 0,
        tasksExecutedToNodes: 0,
        tasksTransferredToCloud: 0
    }
}

io.on("connection", (socket) => {
    console.log("Node", socket.id, "connected to Manager");
    global.clients[socket.id] = {};
})

io.on("connection_error", (error) => {
  console.log(`Connection Error: ${error.message}`);
});

setTimeout(() => {
    console.log("done")

    io.close();
    process.exit();
}, 5 * 1000);