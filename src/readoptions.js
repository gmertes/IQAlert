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
            labAlert: true,
            bonusAlertDone: false,
            bossAlertDone: false,
            eventAlertDone: false,
            labAlertDone: true,
            desktopNotifications: true,
            widgets: {
                battlegrounds: false,
                removeHeader: false,
                removeAuto: false,
                trinketScore: false,
                trinketScoreType: 'battler',
            },
            clanChatAlert: {
                enabled: false,
                all: false,
                members: {},
            },
        }, function (options) {
            resolve(options);
        });
    });
}

module.exports = readOptions;