import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('database.sqlite')

// Create HostData table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS HostData (
            name TEXT PRIMARY KEY,
            value TEXT
        )`)
})

const getHostData = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM HostData', (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

export const Application = {
  hostData: getHostData,
  client: db,
}
