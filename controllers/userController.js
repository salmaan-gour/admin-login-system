const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const session = require('express-session');
const randomstring = require('randomstring');
const config = require('../config/config');

const securePassword = async(password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}
const loginLoad = async(req, res) => {
    try {
        res.render('login');
        return;
    } catch (error) {
        console.log(error.message);
    }
};
// for send mail 
const sendVerifyMail = async(name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });
        const mailOption = {
            from: config.emailUser,
            to: email,
            subject: 'For verification mail',
            html: '<p>Hii ' + name + ', please click here to <a href="http://127.0.0.1:7000/verify?id=' + user_id + '"> verify </a> your mail.</p>'
        }
        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been sent:- ", info.response);
            }
        });
    } catch (error) {
        console.log(error.message);
    }
}
const loadRegister = async(req, res) => {
    try {
        res.render('registration');
        return;
    } catch (error) {
        console.log(error.message);
    }
}
const insertUser = async(req, res) => {
    try {
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            image: req.file.filename,
            password: spassword,
            is_admin: 0
        });
        const userData = await user.save();
        if (userData) {
            sendVerifyMail(req.body.name, req.body.email, userData._id);
            res.render('registration', { message: "Your registration has been successfully, Please verify your mail." });
        } else {
            res.render('registration', { message: "Your registration has been failed." })
        }
    } catch (error) {
        console.log(error.message);
    }
}
const verifyMail = async(req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_varified: 1 } });
        console.log(updateInfo);
        res.render('email-verified');
        return;
    } catch (error) {
        console.log(error.message);
    }
}
const verifyLogin = async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        console.log("userData ",userData);
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_varified === 0) {
                    res.render('login', { message: "Email and password is incorrect" });
                    return;
                } else {
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                    return;
                }
            } else {
                res.render('login', { message: "Email and password is incorrect" });
                return;
            }
        } else {
            res.render('login', { message: "Email and password is incorrect" });
            return;
        }
    } catch (error) {
        console.log(error.message);
    }
};
const loadHome = async(req, res) => {
    try {
        res.render('home');
        return;
    } catch (error) {
        console.log(error.message);
    }
};
const userLogout = async(req, res) => {
    try {
        req.session.destroy();
        res.redirect("/");
        return;
    } catch (error) {
        console.log(error.message);
    }
}
// forget password code start
const forgetLoad = async(req, res) => {
    try {
        res.render('forget');
        return;
    } catch (error) {
        console.log(error.message);
    }
}
const forgetVerify = async(req,res)=>{
try{
    const email = req.body.email;
    const userData = await User.findOne({email:email});
    if(userData){
        if(userData.is_varified == 0){
            res.render('forget', { message: "Please verify your mail." });
        }else{
            const randomString = randomstring.generate();
            const updatedData = await User.updateOne({email:email},{$set:{token:randomString}});

            sendResetPasswordMail(userData.name,userData.email,randomString);
            
            res.render('forget', { message: "Please check your mail to reset your password." });
        }
    }else{
        res.render('forget', { message: "User Email is incorrect" });
    }
}catch(error){
    console.log(error.message);
}
}
// for reset password send mail
const sendResetPasswordMail = async(name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });
        const mailOption = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: '<p>Hii ' + name + ', please click here to <a href="http://127.0.0.1:7000/forget-password?token='+token+'"> Reset </a> your password.</p>'
        }
        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been sent:- ", info.response);
            }
        });
    } catch (error) {
        console.log(error.message);
    }
}
const forgetPasswordLoad = async(req,res)=>{
    try{
        const token = req.query.token;
        const tokenData = await User.findOne({token:token});
        if(tokenData){
            res.render('forget-password', { user_id:tokenData._id});
        }else{
            res.render('404', { message: "Token is invalid." });
        }
    }catch(error){
        console.log(error.message);
    }
}
const resetPassword = async(req,res)=>{
    try{
        const password = req.body.password;
        const user_id = req.body.user_id;
        const secure_password = await securePassword(password);
        const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}});
       res.redirect("/");
    }catch(error){
        console.log(error.message);
    }
}
module.exports = {
    loginLoad,
    loadRegister,
    insertUser,
    verifyMail,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword
}