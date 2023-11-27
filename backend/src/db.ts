// db.ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'host.docker.internal',
  user: 'microgridManager',
  password: 'sluggrid',
  database: 'microgridManager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;