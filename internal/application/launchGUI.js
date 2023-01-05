const { app, BrowserWindow } = require("electron")
const path = require("path")

const loadMainWindow = () => {
    const mainWindow = new BrowserWindow({
        roundedCorners: true,
        thickFrame: true,
        title: "Youtube Watch Bot",
        //kiosk: true,
        autoHideMenuBar: true,

        webPreferences: {
            nodeIntegration: true
        },

        icon: path.join(__dirname, "../ui/public/favicon.png.png")
    })

    mainWindow.loadURL(`http://127.0.0.1:${global.options.server_port}/`);
}

module.exports = new Promise((resolve, reject) => {
    app.whenReady().then(async () => {
        resolve()
        global.server.listen(global.options.server_port)
        loadMainWindow()
    })
})
