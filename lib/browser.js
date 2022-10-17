const puppeteer = require('puppeteer');

let browser;
const BROWSER_LAUNCH = {
    headless: true,
    product: "chrome",
    executablePath: '/usr/bin/google-chrome',
    userDataDir: './chrome',
    args: [
        '--autoplay-policy=user-gesture-required',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-dev-shm-usage',
        '--disable-domain-reliability',
        '--disable-extensions',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-notifications',
        '--disable-offer-store-unmasked-wallet-cards',
        '--disable-popup-blocking',
        '--disable-print-preview',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-setuid-sandbox',
        '--disable-speech-api',
        '--disable-sync',
        '--hide-scrollbars',
        '--ignore-gpu-blacklist',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-first-run',
        '--no-pings',
        '--no-sandbox',
        '--no-zygote',
        '--password-store=basic',
        '--use-gl=swiftshader',
        '--use-mock-keychain',
        '--disable-gpu'
    ]
};

let newPage = async () => {
    if (!browser) {
        browser = await puppeteer.launch(BROWSER_LAUNCH);
    }
    return await browser.newPage()
};
let closePage = async (page) => {
    if (page && !page.isClosed()) {
        await page.close();
    }
    setTimeout(async () => {
        if (browser) {
            const pages = await browser.pages();
            if (!pages.length) {
                await browser.close();
                browser = null;
            }
        }
    }, 100);
};

module.exports = {
    browser,
    newPage,
    closePage
};
