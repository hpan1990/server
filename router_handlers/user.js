
//数据加密包
const bcrypt = require('bcryptjs')

//导入数据库连接
const { pool } = require('../db/pool')
//导入token生成包
const jwt = require('jsonwebtoken')
//导入配置类
const config = require('../config')
//用户注册处理
exports.regUser = (req, res) => {

    //获取用户提交信息
    const user = req.body
    // 删除repassword属性
    Reflect.deleteProperty(user, 'repassword')




    //查询是否用户名可用

    pool.query('select username from user where username = ?', user.username, (err, results) => {
        if (err) return res.send({ status: 1, message: err.message })
        if (results.length > 0) return res.send({ status: 1, message: '用户名已存在，请更换用户名' })

        //加密password
        user.password = bcrypt.hashSync(user.password, 10)

        //写入数据库
        pool.query('insert into user set ?', user, (err, results) => {
            if (err) return res.send({ status: 1, message: err.message })
            if (results.affectedRows > 0) return res.send({ status: 0, message: '注册成功' })
        })

    })

}

//登陆处理
exports.login = (req, res) => {
    //获取页面提交过来的登陆信息
    const userinfo = req.body
    //验证username和password合法性,由express-joi中间件自动验证
    //验证通过，查询数据库
    const sql = `select * from user where username = ?`

    pool.query(sql, userinfo.username, (err, results) => {
        if (err) return res.send({ status: 1, message: err })
        if (results.length !== 1) return res.send({ status: 1, message: '登录失败，用户不存在' })
        //用户存在，则验证密码是否正确
        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
        //密码错误
        if (!compareResult) return res.send({ status: 1, message: '登录失败，密码错误' })
        //密码通过，生成token
        const token = jwt.sign({ ...results[0], password: '', user_avatar: '' }, config.jwtSecret, { expiresIn: config.expiresIn })
        res.send({
            status: 0,
            message: '登陆成功',
            token: 'Bearer ' + token
        })


    })
}

//删除指定用户
exports.delUser = (req, res) => {
    if (!req.body.isSuperAdmin) return res.send({ status: 1, message: '你没有这个权限，需要超级管理员' })
    const sql = ' delete from user where id=?'
    pool.query(sql, req.body.id, (err, results) => {
        if (err) return res.send({ status: 1, message: err.message })

        res.send({
            status: 0,
            message: `删除id:${req.body.id}用户成功`
        })
    })

}