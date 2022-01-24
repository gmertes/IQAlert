import { readOptions } from './option_functions.js';

var soundAuto = chrome.runtime.getURL("auto.mp3")
var soundBoss = chrome.runtime.getURL("boss.mp3")
var soundEvent = chrome.runtime.getURL("event.mp3")
var soundDone =  chrome.runtime.getURL("beep.mp3")

var options, desktopNotificationOnCooldown = false

if (Notification.permission !== "denied") { Notification.requestPermission(); }

const bodyObserver = new MutationObserver(mutations => {
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
                if(options.bossAlert && item.includes("boss-container")){
                    console.log('boss lel')
                    playSound(soundBoss, options.soundVolume);
                    notifyMe('IQ Bean Alert!', 'BOSS! D:')
                }

                //event
                if(options.eventAlert && item.includes("event")){
                    console.log('event lel')
                    playSound(soundEvent, options.soundVolume);
                    notifyMe('IQ Event!', node.innerText.split('\n\n')[1].split('\n')[0])
                }

                //bonus
                if(options.bonusAlert && item.includes("bonus")){
                    console.log('bonus lel')
                    playSound(soundEvent, options.soundVolume);
                    notifyMe('IQ Alert!', 'Bonus! 🥳')
                }
            }

            //raid return
            if(node.parentNode.className === "flex space-between"){
                if(node.innerText.toLowerCase() === "returned"){
                    playSound(soundDone, options.soundVolume);
                    notifyMe('IQ Alert!', 'Raid has returned 😎')
                    console.log('Raid returned kek')
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

                if(options.bonusAlertDone && item.includes("bonus")){
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
            notification = new Notification(title, { body: text });
        }
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    notification = new Notification(title, { body: text });
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
        bodyObserver.observe(document.body, observerOptions);
        console.log('beans lel')
    })
});