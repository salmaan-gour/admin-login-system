const mongoose = require('mongoose');
const express = require('express');
mongoose.connect("mongodb://127.0.0.1:27017/user_management_system");
const app = express();

//for user route
const userRoute = require('./routes/userRoute');
app.use('/',userRoute);

// for admin route
const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);
app.listen(7000,function(){
    console.log("Server is running 7000");
});