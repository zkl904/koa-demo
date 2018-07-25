var router=require('koa-router')();
// 处理数据库（之前已经写好，在mysql.js）
var userModel=require('../lib/mysql.js')
// 时间中间件

var moment=require('moment')

// get '/'页面
router.get('/',async (ctx,next)=>{
  ctx.redirect('/posts')
})

// get '/posts'页面
router.get('/posts',async (ctx,next)=>{
  await ctx.render('posts',{
    session:ctx.session
  })
})

module.exports=router