function readOptions() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get({
            soundVolume: .7,
            autoAlertNumber: 10,
            autoAlert: true,
            raidAlert: true,
            bonusAlert: true,
            bossAlert: true,
            eventAlert: true,
            clanAlert: false,
            bonusAlertDone: false,
            bossAlertDone: false,
            eventAlertDone: false,
            desktopNotifications: true,
            widgets: {
                battlegrounds: false,
                removeHeader: false,
                removeAuto: false,
                trinketScore: false,
                trinketScoreType: 'battler',
            }
        }, function (options) {
            resolve(options);
        });
    });
}

module.exports = readOptions;