const console = require('./console');
const dialer = require('./dialer');

class IQWidget {
    constructor() {
        this.idMain = 'iqwidget_main';
        this.idClan = 'iqwidget_clanmobs';
        this.divMain = undefined;
        this.divClan = undefined;
    }

    attach() {
        if (!document.getElementById(this.idMain)) {
            this.divMain = document.createElement('div');
            this.divMain.id = this.idMain;
            this.divMain.classList.add('margin-top-small');
            this.divMain.style.padding = '0.5rem';

            this.divClan = document.createElement('div');
            this.divClan.id = this.idClan;

            this.divMain.appendChild(this.divClan);

            document.querySelector('.main-game-section').appendChild(this.divMain);

            // check attachment
            if (document.getElementById(this.idMain)) {
                console.debug('Widget attached');
                return true;
            } else {
                console.warn('Something went wrong with widget attachment');
                return false;
            }
        } else {
            return true;
        }
    }

    renderBattlegrounds(data) {
        if (data && this.attach()) {
            this.divClan.innerHTML = '';

            const clanTable = document.createElement('table');
            clanTable.classList.add('table-invisible');
            clanTable.innerHTML = '<caption class="heading">Clan Battlegrounds</caption>';

            const tableHeader = document.createElement('tr');
            tableHeader.innerHTML = '<th>Mob</th><th>Power Level</th><th>Remaining</th>';

            clanTable.appendChild(tableHeader);

            const mobs = data['mobData'];
            const boss = data['bossData'];
            // const mobs = [
            //     {
            //         "id": 1,
            //         "name": "Clan Scavenger",
            //         "powerLevel": 10,
            //         "amount": 48
            //     },
            //     {
            //         "id": 2,
            //         "name": "Clan Invader",
            //         "powerLevel": 100,
            //         "amount": 18
            //     }
            // ]
            // const boss = {
            //     "id": 1,
            //     "name": "Baby Dragon",
            //     "rarity": 2,
            //     "level": 2,
            //     "hpMax": 200000,
            //     "hpRemaining": 28354
            // }

            if (boss) {
                const tr = document.createElement('tr');
                try {
                    tr.className = 'text-rarity-' + boss.rarity;
                } catch {
                    tr.className = 'green-text';
                }
                tr.innerHTML = `<td>${boss.name}</td><td>over 9000!</td><td>${boss.hpRemaining.toLocaleString('en-US')} hp</td>`;
                clanTable.appendChild(tr);
            }

            if (mobs.length > 0) {
                mobs.forEach(mob => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${mob.name}</td><td>${mob.powerLevel.toLocaleString('en-US')}</td><td>${mob.amount}</td>`;
                    clanTable.appendChild(tr);
                });
            }

            if (mobs.length > 0 || boss) {
                this.divClan.appendChild(clanTable);
            }
        }
    }

    update() {
        dialer.loadBattlegrounds().then(data =>{
           this.renderBattlegrounds(data);
        });
    }
}

window.addEventListener('load', function() {
    const widget = new IQWidget();
    console.debug('IQ Widget loaded');

    setTimeout(() => {
        widget.update();

        setInterval(() => {
            setTimeout(() => {
                widget.update();
            }, Math.floor(Math.random() * 3000));
        }, 5000);

    }, 1000);

});