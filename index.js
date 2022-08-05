const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

app.listen(3030);

app.get('/', async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser'
        });
        const page = await browser.newPage();

        await page.setViewport({
            width: Number(req.query.width) || 1920,
            height: Number(req.query.height) || 1080,
            deviceScaleFactor: Number(req.query.scale) || 1
        });

        await page.goto(req.query.url);
        const image = await page.screenshot();

        browser.close();

        return res.header("content-type", "image/jpeg").send(image);
    } catch(err) {
        if (browser && browser.close) {
            browser.close();
        }
        return res.json({
            success: false,
            message: err.message
        });
    }
});
