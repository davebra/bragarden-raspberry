require('dotenv').config()

const serviceAccount = require("./firebaseServiceAccount.json");
const moment = require('moment');
let admin = require("firebase-admin");

const debug = (process.env.DEBUG === "true");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_REALTIMEDB_URL
});

let db = admin.database();

// OBJECTS

let today = moment().format('dddd').toLowerCase();
let pumpsRef = db.ref("pumps");
let scheduleRef = db.ref("schedule");
let schedule = null;
let pumpGpio = {
    pump1: {gpio: 17, status: false},
    pump2: {gpio: 18, status: false},
    pump3: {gpio: 19, status: false},
    pump4: {gpio: 20, status: false},
    pump5: {gpio: 21, status: false}
}

// PUMPS MANUAL ON-OFF

pumpsRef.on("value", function(snapshot) {
    let pumps = snapshot.val();

    for(let pump in pumps) {
        let value = (pumps[pump] === 'on');

        if(pumpGpio[pump].status != value){
            pumpGpio[pump].status = value;
            
            // TODO: turn on or off the pump status
            var valueText = (value) ? "ON" : "OFF";
            if (debug) console.log('pump ' + pump + ' change to ' + valueText );

        }
        
    }

}, function (err) { console.log(err); });

// PUMPS SCHEDULE
scheduleRef.on("value", function(snapshot) {
    schedule = snapshot.val();
}, function (err) { console.log(err); });

function runSchedule() {
    if (schedule){
     
        if(schedule.enable === 'on'){

            let day = moment().format('dddd').toLowerCase();
            let time = parseInt( moment().format('HHmm') );
    
            for(let pump in schedule.pumps) {
                let enabled = (schedule.pumps[pump][day]['enable'] === 'on');
                let override = (schedule.pumps[pump]['override'] === 'on');

                if(enabled && !override){
                    let on = parseInt(schedule.pumps[pump][day]['on']);
                    let off = parseInt(schedule.pumps[pump][day]['off']);
            
                    if (time >= off && pumpGpio[pump].status) {
                    // if e.g. 12:30>=off && pump is ON
                        pumpsRef.child(pump).set('off');
                        if (debug) console.log('scheduled ' + pump + ' turn OFF at ' + time );
                    } else if (time >= on && time < off && !pumpGpio[pump].status) {
                    // if e.g. 12:00>=on && 12:00<on && pump is OFF
                        pumpsRef.child(pump).set('on');
                        if (debug) console.log('scheduled ' + pump + ' turn ON at ' + time );
                    }
                }
                
            }

            // if day is changed, reset the overrides
            if(today !== day){
                if (debug) console.log('reset overrides');
                today = day;
                scheduleRef.update({
                    'pumps/pump1/override': 'off',
                    'pumps/pump2/override': 'off',
                    'pumps/pump3/override': 'off',
                    'pumps/pump4/override': 'off',
                    'pumps/pump5/override': 'off'
                });
            }

        }
        
    }
}

let interval = process.env.SCHEDULE_INTERVAL || 5000;
setInterval(runSchedule, interval);