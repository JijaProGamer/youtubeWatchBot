const path = require("path")
const puppeteer = require("puppeteer-core")
const useProxy = require("puppeteer-page-proxy");

module.exports = function(proxy, index){
    return new Promise((resolve, reject) => {
        puppeteer.launch({
            userDataDir: path.join(__dirname, "../cache", index.toString()),
            executablePath: global.options.browserPath,
            headless: global.options.proxy_tested_headless,
        }).then(async (browser) => {
            let page = await browser.newPage()
            let start = Date.now()

            try {
                new URL(proxy)
            } catch (err) {
                reject({
                    failure: "Invalid proxy URL",
                    error: "Invalid proxy URL"
                })
            }

            if (proxy !== "direct://") {
                useProxy(page, proxy)
            }

            page.goto("https://www.youtube.com", {
                timeout: (global.options.proxyTimeout || 30) * 1000,
                waitUntil: "networkidle2"
            }).then(() => {
                page.close()
                resolve({
                    latency: Date.now() - start
                })
            }).catch((err) => {
                page.close()
                reject({
                    failure: "proxy speed too small, consider increasing proxyTimeout",
                    error: err,
                })
            })
        }).catch((err) => {
            reject({
                failure: "cannot launch browser",
                error: err,
            })
        })
    })
}