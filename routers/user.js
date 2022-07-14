const express = require('express')

const router = express.Router()
//导入用户行为handler
const handler = require('../router_handlers/user')

//导入表单验证包
const expressJoi = require('@escook/express-joi')
//登陆和注册验证schema
const schema = require('../schema/user')


//处理用户注册请求
router.post('/register', expressJoi(schema.user_reg_schema), handler.regUser)

//处理用户登录请求
router.post('/login', expressJoi(schema.user_login_schema), handler.login)
//  删除用户
router.post('/delUser', expressJoi(schema.user_del_schema), handler.delUser)


module.exports = router