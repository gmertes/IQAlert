import { readLocalStorage } from './option_functions.js';
var options
async function set_options(){
    options = await readLocalStorage();
}
set_options()

var soundAuto = chrome.runtime.getURL("auto.mp3")
var soundBoss = chrome.runtime.getURL("boss.mp3")
var soundEvent = chrome.runtime.getURL("event.mp3")

var desktopNotificationOnCooldown = false

if (Notification.permission !== "denied") { Notification.requestPermission(); }

const bodyObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if(mutation.type === "characterData"){
            //autos
            if(options.autoAlert && mutation.target.parentNode.className === "action-timer__text"){
                var autosRemaining = parseInt(mutation.target.data.replace('Autos Remaining: ', ''));
                if((autosRemaining <= options.autoAlertNumber && autosRemaining > 0 && options.autoAlertNumber )) {
                    if (autosRemaining === options.autoAlertNumber) {
                        notifyMe('IQ Auto Alert!', 'You have ' + options.autoAlertNumber + ' autos remaining!');
                    }
                    PlaySound(soundAuto, options.soundVolume);
                }
            }
            //raid
            if(options.raidAlert && mutation.target.data === '00:00') {
                let source = document.getElementsByTagName('html')[0].innerHTML.toLowerCase();
                if(source.includes("raid") && source.includes("returned")){
                    PlaySound(soundEvent, options.soundVolume);
                    notifyMe('IQ Alert!', 'Raid has returned')
                    console.log('Raid returned')
                }
            }
        }

        mutation.addedNodes.forEach(node => {
            if(node.className === "main-section"){
                //boss
                if(options.bossAlert && node.innerHTML.includes("boss-container")){
                    console.log('boss lel')
                    PlaySound(soundBoss, options.soundVolume);
                    notifyMe('IQ Bean Alert!', 'BOSS!')
                }

                //event
                if(options.eventAlert && node.innerHTML.includes("Event")){
                    console.log('event lel')
                    PlaySound(soundEvent, options.soundVolume);
                    notifyMe('IQ Alert!', node.innerText.split('\n\n')[1])
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

function PlaySound(sound, volume = null){
    var audio = new Audio(sound);
    audio.volume = volume;
    audio.play();
}

window.addEventListener("load", function(){
    bodyObserver.observe(document.body, observerOptions);
    console.log('beans lel')
});