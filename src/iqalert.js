import { readOptions } from './option_functions.js';

var soundAuto = chrome.runtime.getURL("auto.mp3")
var soundBoss = chrome.runtime.getURL("boss.mp3")
var soundEvent = chrome.runtime.getURL("event.mp3")
var soundDone =  chrome.runtime.getURL("beep.mp3")

var options, desktopNotificationOnCooldown = false

if (Notification.permission !== "denied") { Notification.requestPermission(); }

const prefix = 'IQ Alert>';
const console = {
    log: (...args) => window.console.log(prefix, ...args),
    debug: (...args) => {if(DEBUG) window.console.log(prefix, ...args)},
    warn: (...args) => window.console.warn(prefix, ...args),
    error: (...args) => window.console.error(prefix, ...args),
};

const bodyObserver = new MutationObserver(mutations => {
    //console.debug(mutations)
    mutations.forEach(mutation => {
        if(mutation.type === "characterData"){
            //autos
            if(options.autoAlert && mutation.target.parentNode.className === "action-timer__text"){
                var autosRemaining = parseInt(mutation.target.data.replace('Autos Remaining: ', ''));
                if((autosRemaining <= options.autoAlertNumber && autosRemaining > 0)) {
                    if (autosRemaining === options.autoAlertNumber) {
                        notifyMe('IQ Auto Alert!', 'You have ' + options.autoAlertNumber + ' autos remaining!');
                    }
                    playSound(soundAuto, options.soundVolume);
                }
            }
        }

        mutation.addedNodes.forEach(node => {
            if(node.className === "main-section"){
                let item = node.innerHTML.toLowerCase()
                //boss
                if(options.bossAlert && item.includes("clickable") && item.includes("boss")){
                    console.log('boss')
                    playSound(soundBoss, options.soundVolume);
                    notifyMe('IQ Alert!', 'BOSS! 🤠')
                }

                //event
                if(options.eventAlert && item.includes("event")){
                    console.log('event')
                    playSound(soundEvent, options.soundVolume);
                    notifyMe('IQ Event!', node.innerText.split('\n\n')[1].split('\n')[0])
                }

                //bonus
                if(options.bonusAlert && item.includes("bonus exp")){
                    console.log('bonus')
                    playSound(soundEvent, options.soundVolume);
                    notifyMe('IQ Alert!', 'Bonus time! 🥳')
                }
            }

            //raid return
            if(options.raidAlert && node.parentNode.className.includes("space-between")){
                if(node.innerText.toLowerCase() === "returned"){
                    playSound(soundDone, options.soundVolume);
                    notifyMe('IQ Alert!', 'Raid has returned 😎')
                    console.log('Raid returned kek')
                }
            }

            if(node.className === "notification"){
                let item = node.innerText
                //gathering bonus
                if(options.eventAlert && item.toLowerCase().includes("gathering bonus is now active")){
                    playSound(soundEvent, options.soundVolume);
                    notifyMe('IQ Gathering Bonus! ⛏', item)
                    console.log('gathering event: ' + item)
                }
            }
        });

        mutation.removedNodes.forEach(node => {
            if(node.className === "main-section"){
                let item = node.innerHTML.toLowerCase()
                if(options.eventAlertDone && item.includes("event")){
                    console.log('event over')
                    playSound(soundDone, options.soundVolume);
                    notifyMe('IQ Alert!', 'Event finished.')
                }

                if(options.bonusAlertDone && item.includes("bonus exp")){
                    console.log('bonus over')
                    playSound(soundDone, options.soundVolume);
                    notifyMe('IQ Alert!', 'Bonus finished (or extended).')
                }

                if(options.bossAlertDone && item.includes("boss-container")){
                    console.log('boss over')
                    playSound(soundDone, options.soundVolume);
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
    if(!desktopNotificationOnCooldown && options.desktopNotifications){
        desktopNotificationOnCooldown = true;
        setTimeout(()=>{ desktopNotificationOnCooldown = false; }, 7000);
        var notification;
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
    var audio = new Audio(sound);
    audio.volume = volume;
    audio.play();
}

window.addEventListener("load", function(){
    readOptions().then(value => {
        options = value
        setTimeout(() => {
            // add timeout to skip past events when IQ is first loaded
            bodyObserver.observe(document.body, observerOptions)
            console.log('v' + VERSION + ' loaded')
        }, 2500);

    })
});