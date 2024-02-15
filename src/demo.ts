import { WebSocketServer } from 'ws';
import { Application } from './db';

const WS_PORT = 8081;

// Create WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });

console.log("WS Server listening on: ws://localhost:%s", WS_PORT);

wss.on('connection', (ws) => {
    console.log('DEMO: new client connected')

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        try {
            if (message.toString() === 'Application.getHostData') {
                Application.hostData().then((rows) => {
                    const responseData: { [key: string]: string } = {};
                    if (Array.isArray(rows)) {
                        rows.forEach(row => {
                            responseData[row.name] = row.value;
                        });
                    } else {
                        console.error('Error: hostData is not an array');
                    }
                    ws.send(JSON.stringify({ type: 'Application.hostData', payload: responseData }));
                }).catch((error) => {
                    ws.send(JSON.stringify({ type: 'error', message: 'Error fetching data' }));
                    console.error('Error fetching data:', error);
                });
            } else {
                ws.send('Unknown message received');
            }
        }
        catch (error) {
            ws.send('Error parsing message');
            console.error('Error parsing message:', error);
        }
    })

    ws.on('close', () => {
        console.log('DEMO: client disconnected')
    })
});
