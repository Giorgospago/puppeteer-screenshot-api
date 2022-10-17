const {PuppeteerScreenRecorder} = require('puppeteer-screen-recorder');
const uuid = require('uuid');
const express = require('express');
const path = require("path");
const app = express();
const {rm, calculateRatio, exec, exists} = require("./lib/helpers");
const {newPage, closePage} = require("./lib/browser");

app.listen(3030);
app.use(express.static('public'));

app.get('/', (req, res) => {
    return res.json({
        success: true,
        message: "Welcome to Puppeteer Screenshot and Video API"
    });
});

app.get('/image', async (req, res) => {
    let page;
    try {
        page = await newPage();
        await page.setViewport({
            width: Number(req.query.width) || 1920,
            height: Number(req.query.height) || 1080,
            deviceScaleFactor: Number(req.query.scale) || 1
        });
        await page.goto(req.query.url, {waitUntil: "networkidle0"});
        const image = await page.screenshot({type: "jpeg"});
        await closePage(page);
        return res.header("content-type", "image/jpeg").send(image);
    } catch (err) {
        await closePage(page);
        return res.json({
            success: false,
            message: err.message
        });
    }
});

app.get('/video', async (req, res) => {
    let page;
    try {
        const viewport = {
            width: Number(req.query.width) || 1920,
            height: Number(req.query.height) || 1080,
            devicePixelRatio: Number(req.query.scale) || 1
        };
        page = await newPage();
        await page.setViewport(viewport);

        const urlParts = new URL(req.query.url);
        const videoConfig = {
            followNewTab: true,
            fps: 25,
            ffmpeg_Path: '/usr/bin/ffmpeg',
            videoFrame: {
                width: viewport.width * viewport.devicePixelRatio,
                height: viewport.height * viewport.devicePixelRatio
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

        if (req.query.jsEvents === "true") {
            await new Promise(async (resolve, reject) => {
                let startTimer, stopTimer;
                startTimer = setTimeout(() => {
                    resolve(true);
                }, req.query.jsEventsStartTimeout || 10_000);
                await page.exposeFunction('startVideoRecording', async () => {
                    clearTimeout(startTimer);
                    await recorder.start(path.join(__dirname, "public/videos", filename));
                    stopTimer = setTimeout(() => {
                        resolve(true);
                    }, req.query.jsEventsStopTimeout || 100_000);
                });
                await page.exposeFunction('stopVideoRecording', async () => {
                    clearTimeout(stopTimer);
                    await recorder.stop();
                    resolve(true);
                });
                await page.goto(req.query.url);
            });
        } else {
            await page.goto(req.query.url, {waitUntil: "networkidle0"});
            await recorder.start(path.join(__dirname, "public/videos", filename));
            await page.waitForTimeout(req.query.duration || 3000);
            await recorder.stop();
        }

        await closePage(page);
        const result = {
            success: true,
            url: req.protocol + '://' + req.get('host') + "/videos/" + filename
        };

        // Add audio
        if (req.query.audio) {
            const input = path.join(__dirname, "public/videos", filename);
            const audio = path.join(__dirname, "public/audios/", req.query.audio);
            if (await exists(audio)) {
                const output = path.join(__dirname, "public/videos", "audio-" + filename);
                await exec(`ffmpeg -i ${input} -i ${audio} -c:v copy -c:a aac -shortest ${output}`);
                result["withAudio"] = req.protocol + '://' + req.get('host') + "/videos/audio-" + filename
            }
        }

        return res.json(result);
    } catch (err) {
        await closePage(page);
        return res.json({
            success: false,
            message: err.message
        });
    }
});
