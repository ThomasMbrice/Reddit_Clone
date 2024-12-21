const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const UserModel = require('../models/user');


// Sign up route
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, displayName, password } = req.body;

        const existingEmail = await UserModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const existingDisplayName = await UserModel.findOne({ displayName });
        if (existingDisplayName) {
            return res.status(400).json({ message: 'Display name already exists' });
        }

        // hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const isAdmin = email.toLowerCase().includes('admin');
        const initialReputation = isAdmin ? 1000 : 100;

        // Create user
        const newUser = new UserModel({
            firstName,
            lastName,
            email,
            displayName,
            password: hashedPassword,
            reputation: initialReputation,
            isAdmin
        });

        await newUser.save();
        
        const userData = newUser.toObject();
        delete userData.password;
        
        res.status(201).json(userData);
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating account' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        req.session.userId = user._id;

        const userData = user.toObject();
        delete userData.password;
        
        res.json({ user: userData });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Check auth status
router.get('/check', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ authenticated: false });
        }
        const user = await UserModel.findById(req.session.userId).select('-password');
        if (!user) {
            return res.status(401).json({ authenticated: false });
        }
        res.json({ authenticated: true, user });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ message: 'Error checking authentication' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router;