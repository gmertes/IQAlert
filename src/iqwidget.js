const console = require('./console')

class IQWidget{
    constructor() {
        this.clanData = undefined
        this.idMain = "iqwidget_main"
        this.idClan = "iqwidget_clanmobs"
        this.divMain = undefined
        this.divClan = undefined
    }

    getData(){
        return new Promise((resolve, reject) => {
            fetch("https://www.iqrpg.com/php/clan.php?mod=loadBattlegrounds", {
                "headers": {
                    "Pragma": "no-cache",
                    "Cache-Control": "no-cache",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
                    "Accept": "application/json, text/plain, */*",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Dest": "empty",
                    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8,nl;q=0.7",
                },
                "Referrer": "https://www.iqrpg.com/game.html",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            }).then(data => data.json()).then(data => {
                 if(data){
                     this.clanData = data
                     resolve(data)
                 }else{
                     this.clanData = undefined
                     reject(undefined)
                 }
            })
        })
    }

    attach(){
        if(!document.getElementById(this.idMain)){
            this.divMain = document.createElement('div');
            this.divMain.id = this.idMain
            this.divMain.classList.add("margin-top-small")
            this.divMain.style.padding = '0.5rem'

            this.divClan = document.createElement('div');
            this.divClan.id = this.idClan

            this.divMain.appendChild(this.divClan)

            document.querySelector(".main-game-section").appendChild(this.divMain)

            // check attachment
            if(document.getElementById(this.idMain)){
                console.debug("Widget attached")
                return true
            }else{
                console.warn("Something went wrong with widget attachment")
                return false
            }
        }else{
            return true
        }
    }

    render(){
        if(this.clanData && this.attach()){
            this.divClan.innerHTML = ''

            const clanTable = document.createElement('table');
            clanTable.classList.add("table-invisible")
            clanTable.innerHTML = '<caption class="heading">Clan Battlegrounds</caption>'

            const tableHeader = document.createElement('tr');
            tableHeader.innerHTML = "<th>Mob</th><th>Power Level</th><th>Remaining</th>"

            clanTable.appendChild(tableHeader)

            const mobs = this.clanData["mobData"]
            const bossData = this.clanData["bossData"]
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
            // const bossData = {
            //     "id": 1,
            //     "name": "Baby Dragon",
            //     "rarity": 2,
            //     "level": 2,
            //     "hpMax": 200000,
            //     "hpRemaining": 28354
            // }
            let bosses

            if(bossData){
                if(bossData instanceof Array){
                    console.debug('bossData is an array')
                    bosses = bossData
                }else{
                    console.debug('converting bossData to array')
                    bosses = [bossData]
                }

                bosses.forEach(boss => {
                    const tr = document.createElement('tr');
                    try{
                        tr.className = "text-rarity-" + boss.rarity
                    }catch{
                        tr.className = "green-text"
                    }
                    tr.innerHTML = `<td>${boss.name}</td><td>over 9000!</td><td>${boss.hpRemaining.toLocaleString('en-US')} hp</td>`
                    clanTable.appendChild(tr)
                })
            }

            if(mobs){
                mobs.forEach(mob => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${mob.name}</td><td>${mob.powerLevel.toLocaleString('en-US')}</td><td>${mob.amount}</td>`
                    clanTable.appendChild(tr)
                })
            }

            if(mobs.length > 0 || bosses)
                this.divClan.appendChild(clanTable)
        }
    }

    update(){
        this.getData().then(() => this.render())
    }
}

window.addEventListener("load", function(){
    const widget = new IQWidget()
    console.debug("IQ Widget loaded")

    setTimeout(() => {
        widget.update()

        setInterval(() => {
            setTimeout(() => {
                widget.update()
            }, Math.floor(Math.random() * 3000))
        }, 5000)

    }, 1000)

})