const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sidahmedshop';

  if (process.env.DNS_SERVERS) {
    const servers = process.env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean);
    try {
      dns.setServers(servers);
      console.log(`[DB] Custom DNS servers: ${servers.join(', ')}`);
    } catch (err) {
      console.warn(`[DB] DNS override failed: ${err.message}`);
    }
  }

  const conn = await mongoose.connect(uri);
  console.log(`[DB] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

module.exports = connectDB;
