import { readOptions } from './option_functions.js';

const soundAuto = chrome.runtime.getURL("auto.mp3")
const soundBoss = chrome.runtime.getURL("boss.mp3")
const soundEvent = chrome.runtime.getURL("event.mp3")
const soundDone =  chrome.runtime.getURL("beep.mp3")

let gOptions, gEventManager
let gDesktopNotificationOnCooldown = false, gStartDelay = true, gFirstClanLoad = false

if (Notification.permission !== "denied") { Notification.requestPermission(); }

const prefix = 'IQ Alert>';
const console = {
    log: (...args) => window.console.log(prefix, ...args),
    debug: (...args) => {if(DEBUG) window.console.log(prefix + "debug>", ...args)},
    warn: (...args) => window.console.warn(prefix, ...args),
    error: (...args) => window.console.error(prefix, ...args),
};

class EventManager{
    constructor() {
        this.clanEvents = new Map()
    }

    newClanEvent(timestamp, msg){
        // return true if the combination of timestamp and msg is a new event, false if it has already been seen
        if(this.clanEvents.get(timestamp) === msg){
            console.debug("Event already in map", timestamp, msg)
            return false
        }else{
            this.clanEvents.set(timestamp, msg)
            console.debug("Event added to map", timestamp, msg)
            return true
        }
    }
}

const bodyObserver = new MutationObserver(mutations => {
    //console.debug(mutations)
    mutations.forEach(mutation => {
        if(mutation.type === "characterData"){
            //autos
            if(gOptions.autoAlert && mutation.target.parentNode.className === "action-timer__text"){
                let autosRemaining = parseInt(mutation.target.data.replace('Autos Remaining: ', ''));
                if((autosRemaining <= gOptions.autoAlertNumber && autosRemaining > 0)) {
                    if (autosRemaining === gOptions.autoAlertNumber) {
                        notifyMe('IQ Auto Alert!', 'You have ' + gOptions.autoAlertNumber + ' autos remaining!');
                    }
                    playSound(soundAuto, gOptions.soundVolume);
                }
            }
        }

        if(mutation.type === "attributes"){
            const cname = mutation.target.className
            const chan = mutation.target.innerText
            // first time opening clan channel timeout
            if(cname && chan){
                if(cname.toLowerCase().includes("active-channel") && chan.toLowerCase() === "clan"){
                    // gFirstClanLoad prevents notifications when clan tab is first opened
                    gFirstClanLoad = true
                    console.debug('Clan tab opened.')
                    setTimeout(() => {
                        if(gFirstClanLoad){
                            gFirstClanLoad = false
                            console.debug('Clan timeout complete.')
                        }
                    }, 1000);
                }
            }
        }

        mutation.addedNodes.forEach(node => {
            if(node.className === "main-section"){
                let item = node.innerHTML.toLowerCase()
                //event
                if(gOptions.eventAlert && item.includes("event")){
                    console.log('event')
                    playSound(soundEvent, gOptions.soundVolume);
                    notifyMe('IQ Event!', node.innerText.split('\n\n')[1].split('\n')[0])
                }

                //bonus
                if(gOptions.bonusAlert && item.includes("bonus exp")){
                    console.log('bonus')
                    playSound(soundEvent, gOptions.soundVolume);
                    notifyMe('IQ Alert!', 'Bonus time! 🥳')
                }
            }

            //raid return
            if(!gStartDelay && node.parentNode.className.includes("space-between")){
                if(gOptions.raidAlert && node.innerText.toLowerCase() === "returned"){
                    playSound(soundDone, gOptions.soundVolume);
                    notifyMe('IQ Alert!', 'Raid has returned 😎')
                    console.log('Raid returned kek')
                }
            }

            if(!gStartDelay && node.className === "notification"){
                let item = node.innerText
                console.debug(item)
                //gathering bonus
                if(gOptions.eventAlert && item.toLowerCase().includes("gathering bonus is now active")){
                    playSound(soundEvent, gOptions.soundVolume);
                    notifyMe('IQ Gathering Bonus! ⛏', item)
                    console.log('gathering event: ' + item)
                }

                //boss
                if(gOptions.bossAlert && item.toLowerCase().includes("rift to the dark realm has opened")){
                    console.log('boss')
                    playSound(soundBoss, gOptions.soundVolume);
                    notifyMe('IQ Alert!', 'BOSS! 🤠')
                }
            }

            // clan alerts
            if(node.className === "chat-msg-clan-global"){
                //Examples:
                //chat-msg: [09:46:55] Peasant Nickname: message
                //chat-msg-clan-global: [12:07:18] Clan: Nickname received a Clan Resource Rush of 26,565 \n\n[Wood]\n\n.

                // First time we open the Clan tab we get historic events. gFirstClanLoad flag is used so that we fill the map
                // with these events without triggering alerts. After the flag is cleared, we start generating
                // alerts for new events.
                const match = node.innerText.match(/\[(.*?)\]/g)
                if(match){
                    const timestamp = match[0].replace("[", "").replace("]", "")
                    const msg = node.innerText.split(":")[3].replaceAll("\n","").trim()

                    if(gOptions.clanAlert && gEventManager.newClanEvent(timestamp, msg)){
                        if(!gFirstClanLoad){
                            playSound(soundDone, gOptions.soundVolume)
                            notifyMe('IQ Clan Alert', msg)
                            console.log('Clan alert: ', msg)
                        }
                    }
                }
            }
        });

        mutation.removedNodes.forEach(node => {
            if(node.className === "main-section"){
                let item = node.innerHTML.toLowerCase()
                if(gOptions.eventAlertDone && item.includes("event")){
                    console.log('event over')
                    playSound(soundDone, gOptions.soundVolume);
                    notifyMe('IQ Alert!', 'Event finished.')
                }

                if(gOptions.bonusAlertDone && item.includes("bonus exp")){
                    console.log('bonus over')
                    playSound(soundDone, gOptions.soundVolume);
                    notifyMe('IQ Alert!', 'Bonus finished (or extended).')
                }

                if(gOptions.bossAlertDone && item.includes("boss-container")){
                    console.log('boss over')
                    playSound(soundDone, gOptions.soundVolume);
                    notifyMe('IQ Alert!', 'Boss defeated.')
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

window.addEventListener("load", function(){
    readOptions().then(options => {
        gOptions = options
        gEventManager = new EventManager()
        bodyObserver.observe(document.body, observerOptions)
        console.log('v' + VERSION + ' loaded')
        setTimeout(() => {
            // add timeout to skip past events when IQ is first loaded
            gStartDelay = false
            console.debug('Startup complete.')
        }, 3000);
    })
});