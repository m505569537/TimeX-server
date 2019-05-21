var express = require('express');
var router = express.Router();

const md5 = require('blueimp-md5')
const { UserModel, AccountModel, CollectModel } = require('../db/models')
const filter = {password:0, __v:0}
const filterAcc = { __v:0,userid:0 }

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 用户注册功能
router.post('/register', function(req, res) {
  // post请求，数据是存储在body中的
  // get请求，数据是在query 或者 params中的
  const { username, password, type } = req.body;

  UserModel.findOne({ username }, function (err, user) {
    if(user) {
      res.send({ code:1, msg: '用户已存在' })
    } else {
      new UserModel({ username, type, password: md5(password) }).save(function (err, user) {
        // 使用cookie
        res.cookie('userid', user._id, { maxAge: 1000*60*60*24 })
        // 返回数据不包括密码
        const data = { username, type, _id: user._id }
        res.send({ code: 0, data })
      })
    }
  })
})

// 用户登录接口
router.post('/login', function(req, res){
  const { username, password } = req.body
  UserModel.findOne({ username, password: md5(password) },filter, function (err, user) {
    if(user){
      res.cookie('userid', user._id, { maxAge: 1000*60*60*24 })
      res.send({ code:0, data: user })
    } else {
      res.send({ code:1, msg: '用户名或密码错误' })
    }
  })
})

// 用户自动登录接口
router.post('/autologin', function (req, res) {
  const { userid } = req.body
  UserModel.findOne( { _id: userid }, filter, function (err, user) {
    if(user){
      res.send({ code: 0, data: user })
    } else {
      res.send({ code:1, msg: '用户已过期' })
    }
  })
})

// 记账app
// 获取账单信息

// 添加账单记录
router.post('/addaccount', function (req, res) {
  const newRecord = req.body
  if(newRecord._id) {
    AccountModel.findByIdAndUpdate({ _id: newRecord._id }, newRecord, function (err, oldRecord) {
      if(!oldRecord){
        res.send({ code: 1, msg: '信息不存在' })
      }
    })
    return;
  }
  new AccountModel(newRecord).save( function(err, record)  {
    const { _id, date, money, title, type } = record
    res.send({ code:0, data: { _id, date, money, title, type } })
  })
})

// 删除账单记录
router.post('/deleteaccount', function (req, res) {
  const { _id } = req.body
  AccountModel.deleteOne({ _id }, function (err, statu){
    console.log(statu);
    if(statu.deletedCount===0){
      res.send({ code: 1, msg: '删除失败' })
    }
  })
})

// 查询账单记录
router.post('/getaccount', function (req, res){
  AccountModel.find( req.body, filterAcc, function (err, records) {
    records = records.reverse()
    res.send({ code:0, data: records })
  })
})

// Todolist

// collections
// 添加信息
router.post('/addcollect', function (req, res){
  const collectinfo = req.body
  if(collectinfo._id){
    // 更新信息
    CollectModel.findByIdAndUpdate({ _id: collectinfo._id }, collectinfo, function (err, oldinfo) {
      if(!oldinfo) {
        res.send({ code:1, msg: '信息不存在' })
      }
    })
    return;
  }
  new CollectModel(collectinfo).save(function (err, info) {
    const { _id, content, completed, deadline } = info
    res.send({ code:0, data: { _id, content, completed, deadline} })
  })
})
// 删除信息

// 查询信息
router.post('/getcollect', function (req, res){
  // 接收userid
  const { userid } = req.body
  let data = {}
  CollectModel.find({ userid, completed:false }, filterAcc,function (err, infos) {
    // res.send({ code:0, data: infos.reverse() })
    data.incomplete = infos
  })
  CollectModel.find({ userid, completed: true }, filterAcc,function (err, infos) {
    // res.send({ code:0, data: infos.reverse() })
    data.completed = infos
  res.send({ code:0, data })
})
})

module.exports = router;
