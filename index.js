const puppeteer = require('puppeteer');
const {PuppeteerScreenRecorder} = require('puppeteer-screen-recorder');
const uuid = require('uuid');
const express = require('express');
const path = require("path");
const app = express();
const {rm, calculateRatio} = require("./lib/helpers");

const BROWSER_LAUNCH = {
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-sandbox",
    ]
};

app.listen(3000);
app.use(express.static('public'));

app.get('/', (req, res) => {
    return res.json({
        success: true,
        message: "Welcome to Puppeteer Screenshot and Video API"
    });
});

app.get('/image', async (req, res) => {
    try {
        const browser = await puppeteer.launch(BROWSER_LAUNCH);
        const page = await browser.newPage();

        await page.setViewport({
            width: Number(req.query.width) || 1920,
            height: Number(req.query.height) || 1080,
            deviceScaleFactor: Number(req.query.scale) || 1
        });

        await page.goto(req.query.url, {waitUntil: "networkidle0"});
        const image = await page.screenshot();

        await browser.close();
        return res.header("content-type", "image/jpeg").send(image);
    } catch (err) {
        console.error(err);
        if (browser && browser.close) {
            browser.close();
        }
        return res.json({
            success: false,
            message: err.message
        });
    }
});

app.get('/video', async (req, res) => {
    try {
        const browser = await puppeteer.launch(BROWSER_LAUNCH);
        const page = await browser.newPage();

        const viewport = {
            width: Number(req.query.width) || 1920,
            height: Number(req.query.height) || 1080,
            deviceScaleFactor: Number(req.query.scale) || 1
        };
        await page.setViewport(viewport);

        await page.goto(req.query.url, {waitUntil: "networkidle0"});

        const urlParts = new URL(req.query.url);
        const videoConfig = {
            followNewTab: true,
            fps: 25,
            ffmpeg_Path: '/usr/bin/ffmpeg',
            videoFrame: {
                width: viewport.width * viewport.deviceScaleFactor,
                height: viewport.height * viewport.deviceScaleFactor,
            },
            videoCrf: 18,
            videoCodec: 'libx264',
            videoPreset: 'ultrafast',
            videoBitrate: 1000,
            autopad: {
                color: 'black' | '#35A5FF',
            },
            aspectRatio: calculateRatio(viewport.width, viewport.height) || '4:3',
        };
        const recorder = new PuppeteerScreenRecorder(page, videoConfig);
        const filename = `${urlParts.host}-${viewport.width}x${viewport.height}-scale.${viewport.deviceScaleFactor}-${uuid.v4()}.mp4`;
        await recorder.start(path.join(__dirname, "public/videos", filename));

        await page.waitForTimeout(3000);

        await recorder.stop();
        await browser.close();

        return res.json({
            success: true,
            url: req.protocol + '://' + req.get('host') + "/videos/" + filename
        });
    } catch (err) {
        console.error("ERROR: ", err);
        if (browser && browser.close) {
            browser.close();
        }
        return res.json({
            success: false,
            message: err.message
        });
    }
});
