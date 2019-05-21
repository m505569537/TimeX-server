// 包含N个操作数据库集合数据的Model模块

const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/mm',{ useNewUrlParser: true })
// 获取数据库连接状态
const conn = mongoose.connection

conn.on('connected', function () {
    console.log('数据库连接成功');
})
// 添加约束
// 用户
const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    type: { type: String, required: true },
})

const UserModel = mongoose.model('user', userSchema)

exports.UserModel = UserModel

// 消费记录
const accountSchema = mongoose.Schema({
    userid: { type: String, required: true },
    money: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: String, required: true }
})

const AccountModel = mongoose.model('account', accountSchema)

exports.AccountModel = AccountModel

// todolist
// 用户id，需要完成的内容，是否已完成，最终期限
const collectSchema = mongoose.Schema({
    userid: { type:String, required: true },
    content: { type:String, required: true },
    completed: { type:Boolean, required: true },
    deadline: { type:String },
})

const CollectModel = mongoose.model('collection',collectSchema)

exports.CollectModel = CollectModel