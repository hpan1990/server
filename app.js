const express = require('express')
const multer = require('multer')
const joi = require('joi')
const cors = require('cors')
const app = express()

app.disable('x-powered-by')


app.use(cors())
//注册表单解析中间件
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('static'))

//导入token解析包
const { expressjwt: jwt } = require('express-jwt')
//导入配置
const config = require('./config')

app.use(jwt({ secret: config.jwtSecret, algorithms: ["HS256"] }).unless({ path: [/^\/[api]/] }))
// 导入用户路由模块
const userRouter = require('./routers/user')
app.use('/api', userRouter)
//导入用户详情模块
const userInfoRouter = require('./routers/userinfo')
const { required } = require('joi')
app.use('/my', userInfoRouter)



//错误处理中间件
app.use((err, req, res, next) => {
    // 处理字段教研错误
    if (err instanceof joi.ValidationError) {
        return res.send({ status: 1, message: err.message })
    }
    // 处理token错误
    if (err.name === 'UnauthorizedError') {
        return res.send({ status: 403, message: '身份验证错误' })
    }
    // 处理文件上传错误
    if (err instanceof multer.MulterError) {
        return res.send({ status: 1, message: err.message })
    }
    res.send({ status: 1, message: '出错了' })
    next()
})

const port = 3020
app.listen(port, () => {
    console.log(`server is running at http://127.0.0.1:${port}/`)

})

