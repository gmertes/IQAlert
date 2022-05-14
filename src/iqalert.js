readOptions = require('./readoptions');
const console = require('./console');

const soundAuto = chrome.runtime.getURL("auto.mp3");
const soundBoss = chrome.runtime.getURL("boss.mp3");
const soundEvent = chrome.runtime.getURL("event.mp3");
const soundDone =  chrome.runtime.getURL("beep.mp3");

let gOptions;
let gDesktopNotificationOnCooldown = false;
let gBonusActive = false;
let gPlayerName = undefined;

if (Notification.permission !== "denied") { Notification.requestPermission(); }

// inject our websocket proxy
const s = document.createElement('script');
s.src = chrome.runtime.getURL('wsproxy.min.js');
s.onload = function() { this.remove(); };
(document.head || document.documentElement).appendChild(s);

function doAlert(sound, text, title = 'IQ Alert!'){
    console.log(text);
    playSound(sound, gOptions.soundVolume);
    notifyMe(title, text);
}

function notifyMe(title, text) {
    if(!gDesktopNotificationOnCooldown && gOptions.desktopNotifications){
        gDesktopNotificationOnCooldown = true;
        setTimeout(()=>{ gDesktopNotificationOnCooldown = false; }, 7000);
        let notification;
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }
        else if (Notification.permission === "granted") {
            notification = new Notification(title, { body: text, silent: true, icon: chrome.runtime.getURL("icon128.png")});
        }
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    notification = new Notification(title, { body: text, silent: true, icon: chrome.runtime.getURL("icon128.png")});
                }
            });
        }
        notification.onclick = function () {
            window.focus();
            this.close();
        };
        setTimeout(notification.close.bind(notification), 7000);
    }
}

function playSound(sound, volume = 0.7){
    let audio = new Audio(sound);
    audio.volume = volume;
    audio.play();
}

// strip HTML and IQ-specific tags
function removeTags(str) {
    if ((str===null) || (str===''))
        return '';
    else
        str = str.toString();

    return str.replace( /(<([^>]+)>)/ig, '')
        .replaceAll('[item:', '')
        .replaceAll(']', '');
}

function handleWSEvent(msg){
    switch(msg.type){
        case 'bonusTime':
            if (msg.data.stage === 'end'){
                gOptions.bonusAlertDone && doAlert(soundDone, 'Bonus finished.');
                gBonusActive = false;
            }else{
                if(gOptions.bonusAlert) {
                    if (gBonusActive)
                        doAlert(soundEvent, 'Bonus time extended! 🎉');
                    else
                        doAlert(soundEvent, 'Bonus time! 🥳');
                }
                gBonusActive = true;
            }
            break;
        case 'msg':
            let msgText = removeTags(msg.data.msg);
            switch(msg.data.type){
                case 'eventGlobal':
                    if (msgText.includes('rift to the dark realm has opened')){
                        gOptions.bossAlert && doAlert(soundBoss,'BOSS! 🤠');
                        break;
                    }
                    if (msgText.includes('gathering bonus is now active')){
                        gOptions.eventAlert && doAlert(soundEvent, msgText, 'IQ Gathering Bonus! ⛏');
                        break;
                    }
                    break;
                case 'clanGlobal':
                    gOptions.clanAlert && doAlert(soundDone, msgText, 'IQ Clan Alert');
                    break;
                case 'global':
                    if (msgText.includes('landed the final blow')){
                        const player = msgText.split(' landed')[0];
                        gOptions.bossAlertDone && doAlert(soundDone, `Boss defeated by ${player}.`);
                    }
                    break;
            }
            break;
        case 'event':
            if(msg.data.stage === 'end'){
                gOptions.eventAlertDone && doAlert(soundDone,'Event finished.');
                break;
            }
            if(gOptions.eventAlert){
                switch(msg.data.type){
                    case 'woodcutting':
                        doAlert(soundEvent, 'A spirit tree has sprung up out of the dirt...', 'Woodcutting event 🪓');
                        break;
                    case 'mining':
                        doAlert(soundEvent, 'A burning meteorite filled with valuable metals...', 'Mining event ⛏');
                        break;
                    case 'quarrying':
                        doAlert(soundEvent, 'A sinkhole has appeared in the ground...', 'Quarrying event ⚒');
                        break;
                }
            }
    }
}

const bodyObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if(gOptions.autoAlert && mutation.type === "characterData"){
            //autos
            if(mutation.target.parentNode.className === "action-timer__text"){
                let autosRemaining = parseInt(mutation.target.data.replace('Autos Remaining: ', ''));
                if((autosRemaining <= gOptions.autoAlertNumber && autosRemaining > 0)) {
                    if (autosRemaining === gOptions.autoAlertNumber) {
                        notifyMe('IQ Auto Alert!', 'You have ' + autosRemaining + ' autos remaining!');
                    }
                    playSound(soundAuto, gOptions.soundVolume);
                }
            }
        }

        mutation.addedNodes.forEach(node => {
            //raid return
            if(gOptions.raidAlert && node.parentNode.className.includes("space-between")){
                if(node.innerText.toLowerCase() === "returned"){
                    doAlert(soundDone,'Raid has returned 😎');
                }
            }
        });
    });
});
const observerOptions = {
    attributes: true,
    subtree: true,
    childList: true,
    characterData: true
};

window.addEventListener("load", function(){
    readOptions().then(options => {
        gOptions = options;
        bodyObserver.observe(document.body, observerOptions);
        console.log('v' + VERSION + ' loaded');
    })
});

window.addEventListener('message', function(event) {
    if(event.data.type === 'iqalert_ws-receive'){
        const data = JSON.parse(event.data.msg);
        (data.type !== 'playersOnline') && console.debug('WS receive:', data);
        handleWSEvent(data);

        if(data.type === 'loadMessages'){
            // use this as an entry point for game start:
            //      user is on game screen and websocket connected

            fetch("https://www.iqrpg.com/php/_load_initial_data.php", {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,nl;q=0.7",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin"
                },
                "referrer": window.location.href,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            }).then(data => data.json()).then(data => {
                console.debug(data);

                gPlayerName = data.player.username;
                console.log(`Welcome back ${gPlayerName}!`);

                if(data.misc.bonusTime.timeRemaining > 0){
                    gBonusActive = true;
                    console.debug('Bonus time was active on load.');
                }else{
                    gBonusActive = false;
                }
            });
        }
    }
});