const express = require('express');
const bodyParser = require('body-parser');
const user_route = express();
const userController = require("../controllers/userController");
const auth = require("../middleware/userAuth");
const session = require('express-session');
const config = require('../config/config');
user_route.use(session({
    secret: 'sessionSecret',
    resave: false, // set to true if you want to save the session data on each request
    saveUninitialized: true // set to false if you want to prevent empty sessions from being created
  }));
user_route.set('view engine','ejs');
user_route.set('views','views/users');

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});

const upload = multer({storage:storage});

user_route.get('/',auth.isLogout,userController.loadRegister);
user_route.post('/register',upload.single('image'),userController.insertUser);

user_route.get('/login',auth.isLogout,userController.loginLoad);
user_route.post('/login',userController.verifyLogin);
user_route.get('/verify',userController.verifyMail);

user_route.get('/home',auth.isLogin,userController.loadHome);
user_route.get('/logout',auth.isLogin,userController.userLogout);
user_route.get('/forget',auth.isLogout,userController.forgetLoad);
user_route.post('/forget',userController.forgetVerify);
user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);
user_route.post('/forget-password',userController.resetPassword);

// user_route.get('*',function(req,res){
//     res.redirect('/');
//     });
module.exports = user_route;