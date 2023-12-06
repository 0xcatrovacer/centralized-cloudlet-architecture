require('dotenv').config();
const { Server } = require('socket.io');

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

io.on('connection', (socket) => {
    console.log('user connected', socket.id);
    clients[socket.id] = {};
})

io.on('connection_error', (error) => {
  console.log(`Connection Error: ${error.message}`);
});

process.on('exit', () => {
    intervals.forEach(interval => clearInterval(interval));
});

setTimeout(() => {
    console.log('===========================================================================');
    console.log('data transferred from manager node to client nodes:', clientDataReceiveCounter);
    console.log('data retained:', clientDataConsumeCounter);
    console.log('data transferred to cloud:', clientDataCloudTransferCounter);
    console.log('===========================================================================');
    console.log('task transferred from manager node to client nodes:', clientTaskRecieveCounter);
    console.log('tasks executed:', clientTaskConsumeCounter);
    console.log('tasks transferred to cloud:', clientTaskCloudTransferCounter);
    console.log('===========================================================================');

    const stats = {
        dataFromManagerToNode: clientDataReceiveCounter,
        dataRetained: clientDataConsumeCounter,
        dataToCloud: clientDataCloudTransferCounter,
        taskFromManagerToNode: clientTaskRecieveCounter,
        taskExecuted: clientTaskConsumeCounter,
        taskToCloud: clientTaskCloudTransferCounter
    }

    fs.writeFileSync(`data/output_server.json`, JSON.stringify(stats, null, 2));
    io.close();
    process.exit();
}, 5 * 1000);