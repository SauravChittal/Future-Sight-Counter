// ==UserScript==
// @name         Pokemon Showdown
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adding future sight functionality
// @author       Saurav
// @match        https://play.pokemonshowdown.com/battle-*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

/*
This is a script which is used to display the number of Future Sight turns during battle.
Context- Future Sight is a Pokemon move which takes 2 turns to land (so does Doom Desire but it's so much more rarer so I haven't included it).
However, there is no indicator which shows when is the move gonna land and it's fairly easy to forget that the move is in effect, so I decided to build one.

I've changed between using var and let to declare variables quite liberally, because their difference is based on scope and so I've changes between them.

I've also opted to not remove console log, instead to just comment them out in case I need them to debug later.

Also, the async, in front of functions is required because otherwise await sleep() can't be used.
*/

// These two variables keep track of which turn it is and whether Future Sight is active or not
let currTurn = 0;
let isFS = -1;
//console.log("Out here");
/*
This function determines whether the opponent used Future Sight or not. Note: Only if the opponent uses it, if you use it, I assume that you can keep track of the turns.
Of course, adding said functionality is fairly easy too.

The idea of the function is, it updates the turn correctly and on the same turn, isFS is also updated, if Future Sight is clicked.
The rest of the turn updating is done by another function to prevent isFS from being changed when one Future Sight is in effect(how it works in game)
*/
function isFutureSightOppo(futureSight, currBattleLength, newBattleLength) {
    //console.log("In helper Function");
   for(let i = currBattleLength; i < newBattleLength; ++i) {
       //console.log("In the for loop");
       if(futureSight[i].textContent.startsWith("Turn")) {
           //console.log("In the Turn if loop");
           currTurn = parseInt(futureSight[i].textContent.slice(5));
       }
       if(futureSight[i].textContent.includes("Future Sight") && futureSight[i].textContent.includes("opposing") && isFS === -1) {
           //console.log("In the Future Sight if");
           isFS = 2;
           displayTimer();
           break;
        }
   }
}

/*
The function which updates the currTurn when Future Sight is in effect.
*/
function turnPassed() {
    //console.log("Here in TurnPassed");
    var battleHist = document.getElementsByClassName("battle-history");
    let currActualTurn = 0;
    for (let i = 0; i < battleHist.length; ++i) {
        if(battleHist[i].textContent.startsWith("Turn")) {
           currActualTurn = parseInt(battleHist[i].textContent.slice(5));
         }
    }
    if (currActualTurn !== currTurn) {
        currTurn = currActualTurn;
        return true;
    } else {
        return false;
    }
}

/*
This function is used to actually display said time by changing the innerHTML of one of the displaying functions.
*/
async function displayTimer() {
    //console.log("In the display function");
    const innerBattle = document.getElementsByClassName("weather");

    while(true) {
        //console.log("In the display While loop " + isFS);
        if(isFS !== -1 && isFS < 3) {
            //console.log("In the display if loop");
            innerBattle[0].innerHTML = "<em><br><br><br><br>Future Sight <small>(" + isFS + " turns)</small><br></em>";
            if (turnPassed() === true) {
                console.log("This should only appear after turns pass after FS is used.");
                --isFS;
            }
            await sleep(1000);
        } else {
            await sleep(1000);
            break;
        }
    }
}

/*
Finally, the function which starts everything off. It is an async function because I needed to use await sleep(), else the website would lag.
It basically calls isFutureSightOppo() when a turn has passed to see if Future Sight was used or not.
*/
async function check() {
    //console.log("In Check");
    var currBattleLength = 0;
    while(true) {
        const futureSight = document.getElementsByClassName("battle-history");
        //console.log("In the while loop " + futureSight.length + " " + currBattleLength);
        if(futureSight.length !== currBattleLength) {
            //console.log("In the if loop");
            isFutureSightOppo(futureSight, currBattleLength, futureSight.length);
            currBattleLength = futureSight.length;
        } else {
            await sleep(1000);
        }
    }
}

/*
The sleep function to ensure the site doesn't lag due to so many while(true) loops
*/
async function sleep(milliseconds) {
      return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/*
The function that starts the entire program. This can be updated to ensure that the user doesn;t need to refresh at the start of every battle.
You'd program this to start on the main page and then run this program if a battle is detected
*/
check();