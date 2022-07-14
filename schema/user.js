//定义注册和登陆数据校验规则schema

const { boolean } = require('joi')
const Joi = require('joi')

const username = Joi.string().alphanum().min(3).max(12).required()
const password = Joi.string().pattern(/^[\S]{6,15}$/).required()
const nick = Joi.string().required()
const email = Joi.string().email().required()
//验证规则---用户注册
const user_reg_schema = {
    body: {
        username,
        password,
        repassword: Joi.ref('password'),
        nick: Joi.string().min(1).max(10),
        email: Joi.string().email(),
        user_avatar: Joi.string(),
        sign: Joi.string().max(15)
    },
}
//验证规则---用户登陆
const user_login_schema = {
    body: {
        username,
        password,

    },
}

//验证规则---删除用户
const user_del_schema = {
    body: {
        id: Joi.number().min(1).greater(0).required(),
        isSuperAdmin: Joi.boolean().required()
    }
}

//验证规则---用户详情更新
const userinfo_update_schema = {
    body: {
        nick,
        email,
    }
}
//验证规则---修改密码
const reset_pwd_schema = {
    body: {
        newPwd: Joi.not(Joi.ref('oldPwd')).concat(password),
        oldPwd: password,
    },
}
exports.user_reg_schema = user_reg_schema
exports.user_login_schema = user_login_schema
exports.userinfo_update_schema = userinfo_update_schema
exports.reset_pwd_schema = reset_pwd_schema
exports.user_del_schema = user_del_schema