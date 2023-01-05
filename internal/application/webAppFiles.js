const path = require("path")
const webApp = global.webApp

webApp.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../ui/public/index.html"))
})

webApp.get("/favicon.png", (req, res) => {
    res.sendFile(path.join(__dirname, "../ui/public/favicon.png"))
})

webApp.get("/global.css", (req, res) => {
    res.sendFile(path.join(__dirname, "../ui/public/global.css"))
})

webApp.get("/build/bundle.js", (req, res) => {
    res.sendFile(path.join(__dirname, "../ui/public/build/bundle.js"))
})

webApp.get("/build/bundle.css", (req, res) => {
    res.sendFile(path.join(__dirname, "../ui/public/build/bundle.css"))
})

webApp.get("/build/bundle.js.map", (req, res) => {
    res.sendFile(path.join(__dirname, "../ui/public/build/bundle.js.map"))
})

webApp.get("/build/bundle.css.map", (req, res) => {
    res.sendFile(path.join(__dirname, "../ui/public/build/bundle.css.map"))
})