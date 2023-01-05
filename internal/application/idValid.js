const gaxios = require("gaxios")

module.exports = function(id) {    
    return new Promise((resolve, reject) => {
        gaxios.request({
            method: "GET",
            url: `https://img.youtube.com/vi/${id}/0.jpg`
        }).then((res) => {
            if (res.status == 200) {
                resolve(true)
            } else {
                reject()
            }
        }).catch((err) => {
            reject(err)
        })
    })
}