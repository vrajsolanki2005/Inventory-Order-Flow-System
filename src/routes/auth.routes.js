// Auth routes
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/userModel');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

router.post('/register', async(req, res) =>{
    const {username, email, password} = req.body;

    //Validate for empty values
    if(!username || !email || !password){
        return res.status(400).json({message: 'Please fill in all fields'});
    }
    //check strong password
    if(!isStrongPasssword(password)){
        return res.status(400).json({message: 'Password is not strong ePassword must be at least 8 characters and include uppercase, lowercase, number, and special character'});
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
})