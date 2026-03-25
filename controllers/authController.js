const bcrypt=require('bcrypt');
const userModel = require('../models/user');
const {generateToken}=require('../utils/generateToken');

module.exports.register = async (req,res)=>{
    try{
        const {name,email,password}=req.body;
        const user = await userModel.findOne({email});
        if(user){
            req.flash("error", "User already exists");
            return res.redirect("/users/register");
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = await userModel.create({name,email,password:hashedPassword});
        const token = generateToken(newUser);
        res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
        req.flash("success", "Account created successfully. You are now logged in!");
        res.redirect("/"); // redirect to dashboard
    }catch(err){
        console.log(err);
        req.flash("error", "Something went wrong during registration");
        res.redirect("/users/register");
    }
}

module.exports.login = async (req,res)=>{
    try{
        const {email,password}=req.body;
        const user = await userModel.findOne({email});
        if(!user){
            req.flash("error", "User not found or invalid credentials");
            return res.redirect("/users/login");
        }
        // for users signed up with google who don't have a password
        if(!user.password) {
            req.flash("error", "Please sign in with Google");
            return res.redirect("/users/login");
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            req.flash("error", "Invalid password");
            return res.redirect("/users/login");
        }
        const token = generateToken(user);
        res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
        req.flash("success", "Welcome back!");
        res.redirect("/"); // Redirect to dashboard normally
    }catch(err){
        console.log(err);
        req.flash("error", "Something went wrong during login");
        res.redirect("/users/login");  
    }
}