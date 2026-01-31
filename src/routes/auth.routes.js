// Auth routes
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/userModel');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { isStrongPassword } = require('../utils/validator');


//register
router.post('/register', async(req, res) =>{
    const {username, email, password} = req.body;

    //Validate for empty values
    if(!username || !email || !password){
        return res.status(400).json({message: 'Please fill in all fields'});
    }
    //check strong password
    if(!isStrongPassword(password)){
        return res.status(400).json({message: 'Password is not strong. Password must be at least 8 characters and include uppercase, lowercase, number, and special character'});
    }
    try{
        //check if already exists
        const userExists = await User.findUserByEmail(email);
        if(userExists){
            return res.status(400).json({message: 'User already exists'});
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //save user
        await db.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]
        );
        res.status(200).json({message:"User created successfully"});

    }
    catch(error){
        console.error(error);
        res.status(500).json({message: 'Error creating user'});
    }
});

//login
router.post('/login', async(req, res) =>{
    const {email, password} = req.body;

//validate user
    if(!email || !password){
        return res.status(400).json({message: 'Please fill in all fields'});
    }
    try{
        //check email
        const user = await User.findUserByEmail(email);
        if(!user){
            return res.status(400).json({message: 'Invalid credentials'});
        }
        //check password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: 'Invalid credentials'});
        }
        //create token
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1d'});
        res.json({token, user:{id: user.id, username: user.username, email: user.email}});
        
    }catch(error){
        console.error(error);
        res.status(500).json({message: 'Error logging in'});
    }
});

module.exports = router;