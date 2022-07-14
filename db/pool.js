//mysql
const mysql = require('mysql')

exports.pool = mysql.createPool({
    host: '42.192.51.136',
    port: '3316',
    user: 'root',
    password: '1234',
    database: 'web_demo'
})
