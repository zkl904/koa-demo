/*
关于数据库的使用这里介绍一下，首先我们建立了数据库的连接池，以便后面的操作都可以使用到，我们创建了一个函数query，通过返回promise的方式以便可以方便用.then()来获取数据库返回的数据，然后我们定义了三个表的字段，通过createTable来创建我们后面所需的三个表，包括posts(存储文章)，users(存储用户)，comment(存储评论)，create table if not exists users()表示如果users表不存在则创建该表，避免每次重复建表报错的情况。后面我们定义了一系列的方法，最后把他们exports暴露出去。*/
/** id主键递增
* name: 用户名
* pass：密码
* title：文章标题
* content：文章内容和评论
* uid：发表文章的用户id
* moment：创建时间
* comments：文章评论数
* pv：文章浏览数
* postid：文章id*/

var mysql = require('mysql');
var config = require('../config/default.js')


var pool  = mysql.createPool({
  host     : config.database.HOST,
  user     : config.database.USERNAME,
  password : config.database.PASSWORD,
  database : config.database.DATABASE
});

// 注册用户
/*我们写了一个_sql的sql语句，意思是插入到users的表中（在这之前我们已经建立了users表）然后要插入的数据分别是name和pass，就是用户名和密码，后面values(?,?)意思很简单，你有几个值就写几个问号，最后调用query函数把sql语句传进去*/
/*let insertData = function( value ) {
  let _sql = "insert into users(name,pass) values(?,?);"
  return query( _sql, value )
}*/

// let query = function( sql, values ) {
// pool.getConnection(function(err, connection) {
//   // 使用连接
//   connection.query( sql,values, function(err, rows) {
//     // 使用连接执行查询
//     console.log(rows)
//     connection.release();
//     //连接不再使用，返回到连接池
//   });
// });
// }


let query = function( sql, values ) {

  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        resolve( err )
      } else {
        connection.query(sql, values, ( err, rows) => {

          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          connection.release()
        })
      }
    })
  })

}

let users=
  `create table if not exists users(
 id INT NOT NULL AUTO_INCREMENT,
 name VARCHAR(100) NOT NULL,
 pass VARCHAR(40) NOT NULL,
 PRIMARY KEY ( id )
);`


// posts(存储文章)
let posts=
  `create table if not exists posts(
 id INT NOT NULL AUTO_INCREMENT,
 name VARCHAR(100) NOT NULL,
 title VARCHAR(40) NOT NULL,
 content  VARCHAR(40) NOT NULL,
 uid  VARCHAR(40) NOT NULL,
 moment  VARCHAR(40) NOT NULL,
 comments  VARCHAR(40) NOT NULL DEFAULT '0',
 pv  VARCHAR(40) NOT NULL DEFAULT '0',
 PRIMARY KEY ( id )
);`

// comment(存储评论)
let comment=
  `create table if not exists comment(
 id INT NOT NULL AUTO_INCREMENT,
 name VARCHAR(100) NOT NULL,
 content VARCHAR(40) NOT NULL,
 postid VARCHAR(40) NOT NULL,
 PRIMARY KEY ( id )
);`

let createTable = function( sql ) {
  return query( sql, [] )
}

// 建表
createTable(users)
createTable(posts)
createTable(comment)

// // 注册用户
// let insertData = function( value ) {
//   let _sql = "insert into users(name,pass) values(?,?);"
//   return query( _sql, value )
// }

// 注册用户
let insertData = ( value ) => {
  let _sql = "insert into users set name=?,pass=?"
  return query( _sql, value )
}

// 发表文章
let insertPost = function( value ) {
  let _sql = "insert into posts(name,title,content,uid,moment) values(?,?,?,?,?);"
  return query( _sql, value )
}

// 更新文章评论数
let updatePostComment = function( value ) {
  let _sql = "update posts set  comments=? where id=?"
  return query( _sql, value )
}

// 更新浏览数
let updatePostPv = function( value ) {
  let _sql = "update posts set  pv=? where id=?"
  return query( _sql, value )
}

// 发表评论
let insertComment = function( value ) {
  let _sql = "insert into comment(name,content,postid) values(?,?,?);"
  return query( _sql, value )
}

// 通过名字查找用户
let findDataByName = function (  name ) {
  let _sql = `
    SELECT * from users
      where name="${name}"
      `
  return query( _sql)
}

// 通过文章的名字查找用户
let findDataByUser = function (  name ) {
  let _sql = `
    SELECT * from posts
      where name="${name}"
      `
  return query( _sql)
}

// 通过文章id查找
let findDataById = function (  id ) {
  let _sql = `
    SELECT * from posts
      where id="${id}"
      `
  return query( _sql)
}

// 通过评论id查找
let findCommentById = function ( id ) {
  let _sql = `
    SELECT * FROM comment where postid="${id}"
      `
  return query( _sql)
}

// 查询所有文章
let findAllPost = function (  ) {
  let _sql = `
    SELECT * FROM posts
      `
  return query( _sql)
}

// 更新修改文章
let updatePost = function(values){
  let _sql=`update posts set  title=?,content=? where id=?`
  return query(_sql,values)
}

// 删除文章
let deletePost = function(id){
  let _sql=`delete from posts where id = ${id}`
  return query(_sql)
}

// 删除评论
let deleteComment = function(id){
  let _sql=`delete from comment where id = ${id}`
  return query(_sql)
}

// 删除所有评论
let deleteAllPostComment = function(id){
  let _sql=`delete from comment where postid = ${id}`
  return query(_sql)
}

// 查找
let findCommentLength = function(id){
  let _sql=`select content from comment where postid in (select id from posts where id=${id})`
  return query(_sql)
}

module.exports={
  query,
  createTable,
  insertData,
  findDataByName,
  insertPost,
  findAllPost,
  findDataByUser,
  findDataById,
  insertComment,
  findCommentById,
  updatePost,
  deletePost,
  deleteComment,
  findCommentLength,
  updatePostComment,
  deleteAllPostComment,
  updatePostPv
}