// server/routes/linkFlairRoutes.js
const express = require('express');
const linkFlairRouter = express.Router();
const LinkFlairModel = require('../models/linkflairs');

const generateId = require('../models/counter');


linkFlairRouter.get('/', async (req, res) => {
    try {
        const linkFlairs = await LinkFlairModel.find();
        res.json(linkFlairs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

linkFlairRouter.post('/', async (req, res) => {
    try {
        const linkFlairID = generateId('lf');

        const { content } = req.body;
        const linkFlair = new LinkFlairModel({
            linkFlairID,
            content
            //url: `/linkflairs/${content.toLowerCase().replace(/\s+/g, '-')}`
        });
        
        const savedLinkFlair = await linkFlair.save();
        console.log("DEBUG LOG", savedLinkFlair); 

        res.status(201).json(savedLinkFlair);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = linkFlairRouter;
