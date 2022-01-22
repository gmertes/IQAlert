var desktopNotificationOnCooldown = false

if (Notification.permission !== "denied") { Notification.requestPermission(); }

const bodyObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if(mutation.type === "characterData"){
            //autos
            if(autoAlert && mutation.target.parentNode.className === "action-timer__text"){
                var autosRemaining = parseInt(mutation.target.data.replace('Autos Remaining: ', ''));
                if((autosRemaining <= autoAlertNumber && autosRemaining > 0 && autoAlertNumber )) {
                    if (autosRemaining === autoAlertNumber) {
                        notifyMe('IQ Alert!', 'You have ' + autoAlertNumber + ' remaining!');
                    }
                    PlaySound(soundAuto, soundVolume);
                }
            }
            //raid
            if(raidAlert && mutation.target.data === '00:00') {
                PlaySound(soundEvent, soundVolume);
                notifyMe('IQ Alert!', 'Raid has returned lel')
                console.log('Raid returned')
            }
        }

        mutation.addedNodes.forEach(node => {

            if(node.className === "main-section"){
                //boss
                if(bossAlert && node.innerHTML.includes("boss-container")){
                    console.log('boss lel')
                    PlaySound(soundBoss, soundVolume);
                    notifyMe('IQ Bean Alert!', 'BOSS!')
                }

                //event
                if(eventAlert && node.innerHTML.includes("Event")){
                    console.log('event lel')
                    PlaySound(soundEvent, soundVolume);
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

bodyObserver.observe(document.body, observerOptions);

function notifyMe(title, text) {
    if(!desktopNotificationOnCooldown && desktopNotifications){
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
    console.log('beans lel')
});