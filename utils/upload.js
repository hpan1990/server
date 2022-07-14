
const multer = require("multer");
const path = require('path');


//存储相关设置
const storage = multer.diskStorage({
    // 硬盘位置，绝对路径
    destination: function (req, res, cb) {
        cb(null, path.join(__dirname, '../static/upload'))
    },
    // 文件名(默认无后缀)
    filename: function (req, file, cb) {
        cb(null, 'avatar_' + req.auth.username + '_' + req.auth.id + '.' + file.mimetype.split('\/')[1])
    }


})
//上传限制
const limits = {
    fileSize: 1 * 1024 * 1024,

}
//文件上传对象
const upload = multer({ storage: storage, limits: limits })

module.exports = upload