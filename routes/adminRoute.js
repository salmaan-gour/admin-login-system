const express = require('express');
const admin_route = express();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/adminAuth");
const session = require('express-session');
const config = require('../config/config');
admin_route.use(session({
    secret: 'sessionSecret',
    resave: false, // set to true if you want to save the session data on each request
    saveUninitialized: true // set to false if you want to prevent empty sessions from being created
  }));
const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));
admin_route.set('view engine','ejs');
admin_route.set('views','views/admin');

admin_route.get('/',auth.isLogout,adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);
admin_route.get('/home',auth.isLogin,adminController.loadDashboard);
admin_route.get('/logout',auth.isLogin,adminController.adminLogout);
admin_route.get('*',function(req,res){
    res.redirect('/admin');
    });
module.exports = admin_route;