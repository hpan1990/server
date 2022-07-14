
//导入base64-img 包
const base64Img = require('base64-img')
const bcrypt = require('bcryptjs')


//处理上传文件包

const { pool } = require('../db/pool')
//分页模型
const pagination = require('../utils/pagination')


//获取用户详情处理函数(仅对已登陆用户)
exports.getUserInfo = (req, res) => {
    //从token获取用户id
    const id = req.auth.id
    //查询数据库
    const sql = `select id,username,nick,email,user_avatar,sign from user where id =?`
    pool.query(sql, id, (err, results) => {
        //查询出错，返回错误
        if (err) return res.send({ status: 1, message: err.message })
        //查询成功返回用户信息
        res.send({
            status: 0,
            message: '查询用户信息成功',
            data: results[0],
        })
    })
}

//更新用户详情(用户名、昵称,email)
exports.updateUserInfo = (req, res) => {
    //获取前端提交的用户修改数据
    // const { nick, email } = req.body
    // console.log(nick, email)
    //对数据进行校验(中间件完成)
    // 通过后写入数据库
    const sql = `update user set ? where id =?`
    pool.query(sql, [req.body, req.auth.id], (err, results) => {
        if (err) return res.send({ status: 1, message: err.message })
        if (results.affectedRows !== 1) {
            return res.send({
                status: 1,
                message: '更新用户信息失败',
            })
        }
        res.send({
            status: 0,
            message: '用户信息更新成功',
        })
    })
}

//重置密码
exports.resetPwd = (req, res) => {

    //获取提交的新旧密码并验证规则
    //查数据库验证旧密码是否正确
    const sql = `select password from user where id=?`
    pool.query(sql, req.auth.id, (err, results) => {
        if (err) return res.send({
            status: 1,
            message: err.message,
        })

        // console.log(req.body, results[0].password)
        //数据库加密的密码解密比较
        const compared = bcrypt.compareSync(req.body.oldPwd, results[0].password)

        if (!compared) return res.send('原密码错误')

        //加密新密码
        const newPwd = bcrypt.hashSync(req.body.newPwd, 10)

        //修改数据库密码为新密码
        const update_pwd_sql = `update user set password=? where id =?`
        pool.query(update_pwd_sql, [newPwd, req.auth.id], (err, results) => {
            if (err) return res.send({
                status: 1,
                message: err.message,
            })
            if (results.affectedRows !== 1) {
                return res.send({
                    status: 1,
                    message: '重置密码失败',
                })
            }
            res.send({
                status: 0,
                message: '密码重置成功',
            })

        })


    })

}

//更换(设置)头像
exports.changeAvatar = (req, res) => {
    //获取前端传过来的头像
    const avatar_file = req.file
    // console.log(avatar_file)
    //将头像base64编码
    const toBase64 = base64Img.base64Sync(avatar_file.path)
    console.log(toBase64)
    //写入数据库
    const sql = `update user set user_avatar=? where id =?`
    pool.query(sql, [toBase64, req.auth.id], (err, results) => {
        if (err) return res.send({ status: 1, message: err.message })
        if (results.affectedRows !== 1) {
            return res.send({ status: 1, message: '头像更换失败！' })
        }
        res.send({
            status: 0,
            message: '头像更换成功！',
        })
    })
}
// 获取收藏列表
exports.getUserLikes = (req, res) => {
    const sql = 'select * from user_likes where uid = ? order by create_time desc'
    const from = req.query.from
    pool.query(sql, req.auth.id, (err, results) => {
        if (err) return res.send({ status: 1, message: err.message })
        if (from === 'user') {
            res.send({ status: 0, message: 'ok', length: results.length })
        } else {
            //进行分页处理
            let currentPage = req.query.page || 1
            const p = pagination.createPagination(results.length, req.query.page)
            //起始点
            let start = (p.currentPage - 1) * p.itemsPerPage
            // 结束点
            let end = start + p.itemsPerPage >= results.length ? results.length : start + p.itemsPerPage
            res.send({
                status: 0,
                message: '获取用户收藏列表成功',
                totalItems: p.totalItems,
                pages: p.pages(),
                currentPage: p.currentPage,
                data: results.slice(start, end)
            })
        }

    })

}
//添加收藏列表
exports.addUserLikes = (req, res) => {
    const uid = req.auth.id
    //如果是同一用户重复收藏同一个视频，则只是更新时间
    const vod_id = req.body.vod_id
    pool.query('select uid,vod_id,create_time from user_likes where uid = ? and vod_id=?', [uid, vod_id], (err, results) => {
        if (err) return res.send({ status: 1, message: err.message })
        // 已经收藏过,删除
        if (!results.length == 0)
            pool.query('delete from user_likes where uid = ? and vod_id = ?', [uid, vod_id])

        //插入数据
        const sql = 'insert into user_likes set ?'
        pool.query(sql, { ...req.body, uid }, (err, results) => {
            if (err) return res.send({ status: 1, message: err.message })
            if (results.affectedRows === 1) {
                res.send({
                    status: 0,
                    message: 'ok，添加收藏成功'
                })
            } else {
                res.send({
                    status: 1,
                    message: 'failed，添加收藏失败'
                })
            }

        })

    })
}

//删除收藏列表
exports.delLikes = (req, res) => {
    const vids = req.body
    console.log(vids)
    const sql = 'delete from user_likes where uid = ? and vod_id =?'

    for (let i = 0; i < vids.length; i++) {
        pool.query(sql, [req.auth.id, vids[i]], (err, results) => {
            console.log(vids[i])
            if (err) return res.send({ status: 1, message: err.message })
            if (results.affectedRows !== 1) {
                return res.send({ status: 1, message: `收藏删除失败----$vod_id = ${vids[i]}` })
            }
        })
    }
    res.send({ status: 0, message: 'ok,删除收藏成功' })
}

// 获取历史记录
exports.getUserHistory = (req, res) => {

    const sql = 'select * from user_history where uid = ? order by create_time desc'
    pool.query(sql, req.auth.id, (err, results) => {
        if (err) return res.send({ status: 1, message: err.message })
        //进行分页处理
        let currentPage = req.query.page || 1
        const p = pagination.createPagination(results.length, req.query.page)
        //起始点
        let start = (p.currentPage - 1) * p.itemsPerPage
        // 结束点
        let end = start + p.itemsPerPage >= results.length ? results.length : start + p.itemsPerPage
        res.send({
            status: 0,
            message: '获取历史记录成功',
            totalItems: p.totalItems,
            pages: p.pages(),
            currentPage: p.currentPage,
            data: results.slice(start, end)
        })
    })

}
// 添加历史记录
exports.addUserHistory = (req, res) => {

    const uid = req.auth.id
    //如果是同一用户重复观看同一个视频，则只是更新时间
    const vod_id = req.body.vod_id
    pool.query('select uid,vod_id,create_time from user_history where uid = ? and vod_id=?', [uid, vod_id], (err, results) => {
        if (err) return res.send({ status: 1, message: err.message })
        // 有记录,删除
        if (!results.length == 0)
            pool.query('delete from user_history where uid = ? and vod_id = ?', [uid, vod_id])
        //插入数据
        const sql = 'insert into user_history set ?'
        pool.query(sql, { ...req.body, uid }, (err, results) => {
            if (err) return res.send({ status: 1, message: err.message })
            if (results.affectedRows === 1) {
                res.send({
                    status: 0,
                    message: 'ok，添加历史记录成功'
                })
            } else {
                res.send({
                    status: 1,
                    message: 'failed，添加历史记录失败'
                })
            }

        })

    })

}
//删除历史记录
exports.delHistory = (req, res) => {
    const vids = req.body
    console.log(vids)
    const sql = 'delete from user_history where uid = ? and vod_id =?'

    for (let i = 0; i < vids.length; i++) {
        pool.query(sql, [req.auth.id, vids[i]], (err, results) => {
            console.log(vids[i])
            if (err) return res.send({ status: 1, message: err.message })
            if (results.affectedRows !== 1) {
                return res.send({ status: 1, message: `历史记录删除失败----$vod_id = ${vids[i]}` })
            }
        })
    }
    res.send({ status: 0, message: 'ok,删除成功' })
}



