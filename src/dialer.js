function dial(url) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            "headers": {
                "Accept": "application/json, text/plain, */*"
            },
            "method": "GET"
        }).then(data => data.json()).catch(() => {
            reject();
        }).then(data => {
            if (data) {
                resolve(data);
            } else {
                reject();
            }
        });
    });
}

const dialer = {
    loadBattlegrounds: () => dial("/php/clan.php?mod=loadBattlegrounds"),
    loadClanMembers: () => dial("/php/clan.php?mod=loadMembers"),
    loadInitialData: () => dial("/php/_load_initial_data.php"),
    loadTrinkets: () => dial('/php/equipment.php?mod=loadTrinkets'),
}

module.exports = dialer;