import WebSocket from 'ws';
import sqlite3 from 'sqlite3';

// Connect to the SQLite database
const db = new sqlite3.Database('database.sqlite');

// Create HostData table if not exists
db.run(`CREATE TABLE IF NOT EXISTS HostData (
    name TEXT PRIMARY KEY,
    value TEXT
)`);

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Listen for WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');

    // Listen for messages from client
    ws.on('message', () => {
        // Select all data from HostData table
        db.all('SELECT * FROM HostData', (err, rows) => {
            if (err) {
                console.error('Error retrieving data:', err);
                return;
            }

            // Format data into payload schema
            const payload: { [key: string]: any } = {};
            rows.forEach((row: any) => {
                payload[row.name] = row.value;
            });

            // Send payload to client
            ws.send(JSON.stringify(payload));
        });
    });
});

// Run the server
console.log('Server running on port 8080');
