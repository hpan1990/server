//mysql
const mysql = require('mysql')

exports.pool = mysql.createPool({
    host: 'xxx',
    port: '3306',
    user: 'xxx',
    password: 'xxx',
    database: 'web_demo'
})
