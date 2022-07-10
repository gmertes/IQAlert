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
    loadBattlegrounds: () => dial("https://www.iqrpg.com/php/clan.php?mod=loadBattlegrounds"),
    loadInitialData: () => dial("https://www.iqrpg.com/php/_load_initial_data.php"),
    loadTrinkets: () => dial('https://www.iqrpg.com/php/equipment.php?mod=loadTrinkets'),
}

module.exports = dialer;