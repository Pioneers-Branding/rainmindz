const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('file:///Users/aniketsharma/Desktop/rainmindz/index.html');
    await page.waitForTimeout(2000);
    const data = await page.evaluate(() => {
        let el = document.getElementById('orbit-label-0');
        if (!el) return 'Not found';
        let rect = el.getBoundingClientRect();
        let computed = window.getComputedStyle(el);
        return {
            x: rect.x, y: rect.y, width: rect.width, height: rect.height,
            opacity: computed.opacity, color: computed.color,
            display: computed.display, visibility: computed.visibility,
            zIndex: computed.zIndex, text: el.innerText
        };
    });
    console.log(JSON.stringify(data));
    await browser.close();
})();
