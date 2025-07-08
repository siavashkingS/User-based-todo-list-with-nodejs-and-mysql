const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'siavash',       // replace with your MySQL user
  password: '13800831',       // and password
  database: 'mydb' // your database name
});

connection.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');
});

module.exports = connection;