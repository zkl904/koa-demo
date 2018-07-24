var router=require('koa-router')();
var userModel=require('../lib/mysql.js');

// 加密
var md5=require('md5')

// GET '/signup' 注册页
// 使用get方式得到’/signup’页面，然后渲染signup模板，这里我们还没有在写signup.ejs

/*我们之前在/routers/signup.js get ‘/signup’ 中 向模板传递了session参数 session:ctx.session,存取的就是用户的信息，包括用户名、登录之后的id等，之所以可以通过ctx.session获取到，因为我们在后面登录的时候已经赋值 如ctx.session.user=res[0][‘name’]*/
router.get('/signup',async (ctx,next)=>{
  await ctx.render('signup',{   // 为何这里自动识别了 signup.ejs???
    session: ctx.session
  })
})

// POST '/signup' 注册页
/*我们使用md5实现密码加密
使用我们之前说的bodyParse来解析提交的数据，通过ctx.request.body得到
我们引入了数据库的操作 findDataByName和insertData，因为之前我们在/lib/mysql.js中已经把他们写好，并暴露出来了。意思是先从数据库里面查找注册的用户名，如果找到了证明该用户名已经被注册过了，如果没有找到则使用insertData增加到数据库中
ctx.body 是我们通过ajax提交之后给页面返回的数据，比如提交ajax成功之后msg.data=1的时候就代表用户存在，msg.data出现在后面的signup.ejs模板ajax请求中*/
router.post('/signup',async (ctx,next)=>{
  console.log(ctx.request.body)
  var user={
    name:ctx.request.body.name,
    pass:ctx.request.body.password,
    repeatpass:ctx.request.body.repeatpass
  }
  await userModel.findDataByName(user.name)
    .then(result=>{
      // var res=JSON.parse(JSON.stringify(reslut))
      console.log(result)

      if (result.length){
        try {
          throw Error('用户存在')
        }catch (error){
          //处理err
          console.log(error)
        }
        ctx.body={
          data:1
        };;
      }else if (user.pass!==user.repeatpass || user.pass==''){
        ctx.body={
          data:2   // 两次密码不一致
        };
        console.log('两次密码不一致')
      }else{
        ctx.body={
          data:3
        };
        console.log('注册成功')
        // ctx.session.user=ctx.request.body.name
        userModel.insertData([ctx.request.body.name,md5(ctx.request.body.password)])
      }
    })

})


module.exports=router