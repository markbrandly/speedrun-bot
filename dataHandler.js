const fs = require('fs');
const { getEnvironmentData } = require('worker_threads');

let rawdata = fs.readFileSync('data.json');
let data = JSON.parse(rawdata);

const quests = [
    "Dragon Slayer 1",
    "Cook's Assistant",
    "Demon Slayer",
    "Vampyre Slayer",
    "Ernest the Chicken"
]

const copy = (obj) => JSON.parse(JSON.stringify(obj))

const ticksToTime = (ticks)=>{

    let timeStr = ""

    if(ticks >= 6000){
        timeStr = timeStr + Math.trunc(ticks / 6000) + ":"
    }

    if(ticks >= 100) {
        let mins = "0" + Math.trunc((ticks % 6000)/100)
        timeStr = timeStr + (mins.substring(mins.length - 2)) + ":"
    }

    let secs = "0" + (ticks * 0.6).toFixed(1)
    timeStr = timeStr + secs.substring(secs.length - 4) + "s"
    if(timeStr[0] === "0"){
        timeStr = timeStr.substring(1)
    }
    return timeStr
}

const timeToTicks = (time) => {
    if(!/([0-9]{1,2}:)?([0-5][0-9]:)?[0-9]{1,2}(\.[2468]0?)?/.test(time)){
        return false
    }

    let ticks = 0

    let timeSplit = time.split(":")
    if(timeSplit.length === 1){
        ticks += Math.trunc(parseFloat(timeSplit[0]) / 0.6)
    }
    else if(timeSplit.length === 2){
        ticks += Math.trunc(parseFloat(timeSplit[1]) / 0.6)
        ticks += parseInt(timeSplit[0]) * 100
    }
    else if(timeSplit.length === 3){
        ticks += Math.trunc(parseFloat(timeSplit[2]) / 0.6)
        ticks += parseInt(timeSplit[1]) * 100
        ticks += parseInt(timeSplit[0]) * 100 * 60
    }

    return ticks
}

const dataHandler = {
    data: data,
    set setData(newData){
        this.data = newData
        fs.writeFile('data.json', JSON.stringify(this.data, null, 2), 'utf8', ()=>{});
    },
    get getData(){
        return copy(this.data)
    }
}


const addSubmission = (user, quest, time, image, video = null) => {
    if(!quests.includes(quest)){
        return {success: false, msg: "Invalid quest name"}
    }

    if(!/([0-9]{1,2}:)?([0-5][0-9]:)?[0-9]{1,2}(\.[2468]0?)?/.test(time)){
        return {success: false, msg: "Invalid time string"}
    }

    let ticks = timeToTicks(time)

    let submission = {
        user,
        quest,
        time: ticks,
        image,
        video: null,
        denied: false,
        confirmed: false,
        lastEditor: null,
        videoVerified: false,
        date: Date.now()
    }
    let data = dataHandler.getData;
    data.push(submission)
    dataHandler.setData = data
    return {success: true, id: data.length - 1}
}

const changeSubmission = (id, newData) => {
    let data = dataHandler.getData;
    data[id] = newData;
    dataHandler.setData = data
}

const confirmSubmission = (id, user) => {
    let subObj = getSubmission(id)
    if(!subObj.success){
        return {success: false}
    }

    let data = subObj.submission

    let newData = {
        ...data,
        confirmed: true,
        denied: false,
        lastEditor: user
    }

    changeSubmission(id, newData)
}

const denySubmission = (id, user) => {
    
}

const verifySubmission = (id, user, video = null) => {
    let subObj = getSubmission(id)
    if(!subObj.success){
        return {success: false}
    }

    let data = subObj.submission
}


const getSubmission = (id) => {
    let data = dataHandler.getData;
    if(id >= data.length){
        return {success:false}
    }

    let submission = data[id]
    // submission.date = new Date(submission.date).toLocaleDateString("en-US")
    
    // submission.time = ticksToTime(submission.time)
    // submission.id = id
    return {
        success: true,
        submission
    }
}

const getSubmissionFormatted = (id) => {
    let data = dataHandler.getData;
    if(id >= data.length){
        return {success:false}
    }

    let submission = data[id]
    submission.date = new Date(submission.date).toLocaleDateString("en-US")
    
    submission.time = ticksToTime(submission.time)
    submission.id = id
    return {
        success: true,
        submission
    }
}

const getLeaders = (quest) => {
    let data = dataHandler.getData;
    let validEntries = data.filter((entry) => {
        if(entry.quest !== quest){
            return false
        }

        if(!entry.confirmed){
            return false
        }

        return true
    })

    let sortedEntries = validEntries.sort((a, b) => {
        if(a.time > b.time){
            return 1
        }

        if(b.time > a.time){
            return -1
        }

        if(a.date > b.date){
            return 1
        }

        if(b.date > a.date){
            return -1
        }

        return 0
    })

    const names = new Set()

    let filteredEntries = sortedEntries.filter((entry) => {
        if(names.has(entry.user.toLowerCase())){
            return false
        }
        else{
            names.add(entry.user.toLowerCase())
            return true
        }
    })

    return filteredEntries.slice(0, 10)
}

module.exports = {
    addSubmission,
    getSubmission,
    getSubmissionFormatted,
    confirmSubmission,
    getLeaders,
    ticksToTime
}