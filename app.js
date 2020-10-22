var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require("express-session");//session
var logger = require('morgan');
var ejs = require('ejs');//更改支持的页面类型

var cors = require('cors');//跨域
var router = require('./routes/router');//将路由放到单独文件中

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.__express);//支持的页面类型更改为HTML
app.set('view engine', 'html');//支持的页面类型更改为HTML

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({//开启session
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: ('name', 'value', { maxAge: 1000 * 60 * 60 * 12, secure: false })
}));

app.all('/*',(req,res,next)=>{//权限控制
  // authToken(req,res,next);
  var session = req.session;
  var url = req.url;
  var regx = /^\/admin*/;
  if(!regx.test(url) && !session.user){
    res.redirect('/admin');
  }else if(url == '/admin' && session.user){
    res.redirect('/');
  }else{
    next();
  }
});

app.use(cors());//实现跨域
app.use(router);//使用路由

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.render('error');
});

module.exports = app;
