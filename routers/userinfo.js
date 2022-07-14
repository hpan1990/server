
const express = require('express')
const router = express()
//导入表单验证中间件
const expressJoi = require('@escook/express-joi')
//导入验证schema
const { userinfo_update_schema, reset_pwd_schema } = require('../schema/user')

//导入处理函数
const userInfoRouter = require('../router_handlers/userinfo')

//导入上传配置包
const upload = require('../utils/upload')
//用户详情路由
router.get('/userinfo', userInfoRouter.getUserInfo)
//更新用户信息路由
router.post('/userinfo', expressJoi(userinfo_update_schema), userInfoRouter.updateUserInfo)
//重置用户密码路由
router.post('/userinfo/pwd', expressJoi(reset_pwd_schema), userInfoRouter.resetPwd)
//更换用户头像路由
router.post('/userinfo/avatar', upload.single('avatar'), userInfoRouter.changeAvatar)

// **************用户收藏与观看历史记录**************
// 获取用户收藏列表
router.get('/userinfo/likes', userInfoRouter.getUserLikes)
// 添加用户收藏列表
router.post('/userinfo/likes', userInfoRouter.addUserLikes)
// 删除用户观看历史记录
router.delete('/userinfo/likes', userInfoRouter.delLikes)
// 获取用户浏览历史记录
router.get('/userinfo/history', userInfoRouter.getUserHistory)
// 添加用户观看历史记录
router.post('/userinfo/history', userInfoRouter.addUserHistory)
// 删除用户观看历史记录
router.delete('/userinfo/history', userInfoRouter.delHistory)

module.exports = router