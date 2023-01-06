const { random } = require("youtube-selfbot-api/application/publicFunctions/everything")
const getVideoMetadata = require("youtube-selfbot-api/application/youtubeAPI/getVideoMetadata")
const uuid = require("uuid")

module.exports = async function(video, account){
    let proxies = global.options.proxies
    let styles = typeof video.style == "string" && [video.style] || video.style
    let video_stats = await getVideoMetadata(video.id)
    let watchTime = video.watchTime

    let job = {
        id: video.id,
        uuid: uuid.v4(),
        is_live: video.is_live,
        proxy: proxies[Math.floor(random(0, proxies.length))],
        style: styles[Math.floor(random(0, styles.length))],
        duration: video_stats.duration,
    }

    if(typeof watchTime == "string"){
        let parts = watchTime.split("-")
        if(parts[1]){
            let rand = random(parseInt(parts[0]), parseInt(parts[1]))

            if(watchTime.includes("%")){
                watchTime = (video_stats.duration / 100) * rand
            } else {
                watchTime = rand
            }
        } else {
            watchTime = (video_stats.duration / 100) * parseInt(parts[0])
        }
    } else if(typeof watchTime == "object"){
        let rand = random(parseInt(watchTime[0]), parseInt(watchTime[1]))
        watchTime = (video_stats.duration / 100) * rand
    }

    job.watchTime = watchTime

    if(account){
        if(account.like){
            if(account.likeAfter){
                if(typeof account.likeAfter == "string"){
                    let parts = account.likeAfter.split("-")
                    if(parts[1]){
                        let rand = random(parseInt(parts[0]), parseInt(parts[1]))
            
                        if(account.likeAfter.includes("%")){
                            account.likeAfter = (video_stats.duration / 100) * rand
                        } else {
                            account.likeAfter = rand
                        }
                    } else {
                        account.likeAfter = (video_stats.duration / 100) * parseInt(parts[0])
                    }
                } else if(typeof account.likeAfter == "object"){
                    let rand = random(parseInt(account.likeAfter[0]), parseInt(account.likeAfter[1]))
                    account.likeAfter = (video_stats.duration / 100) * rand
                }
            } else {
                account.likeAfter = 0
            }
        }

        if(account.dislike){
            if(account.dislikeAfter){
                if(typeof account.dislikeAfter == "string"){
                    let parts = account.dislikeAfter.split("-")
                    if(parts[1]){
                        let rand = random(parseInt(parts[0]), parseInt(parts[1]))
            
                        if(account.likeAfter.includes("%")){
                            account.dislikeAfter = (video_stats.duration / 100) * rand
                        } else {
                            account.dislikeAfter = rand
                        }
                    } else {
                        account.dislikeAfter = (video_stats.duration / 100) * parseInt(parts[0])
                    }
                } else if(typeof account.dislikeAfter == "object"){
                    let rand = random(parseInt(account.dislikeAfter[0]), parseInt(account.dislikeAfter[1]))
                    account.dislikeAfter = (video_stats.duration / 100) * rand
                }
            } else {
                account.dislikeAfter = 0
            }
        }

        if(account.comment && account.comment.length > 0){
            if(account.commentAfter){
                if(typeof account.commentAfter == "string"){
                    let parts = account.commentAfter.split("-")
                    if(parts[1]){
                        let rand = random(parseInt(parts[0]), parseInt(parts[1]))
            
                        if(account.commentAfter.includes("%")){
                            account.commentAfter = (video_stats.duration / 100) * rand
                        } else {
                            account.commentAfter = rand
                        }
                    } else {
                        account.commentAfter = (video_stats.duration / 100) * parseInt(parts[0])
                    }
                } else if(typeof account.commentAfter == "object"){
                    let rand = random(parseInt(account.commentAfter[0]), parseInt(account.commentAfter[1]))
                    account.commentAfter = (video_stats.duration / 100) * rand
                }
            } else {
                account.commentAfter = 0
            }
        }

        job.login = true
        job = {...job, account}
    }

    global.jobs.push(job)
}