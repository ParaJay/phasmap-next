import React from "react";
// import { equipment, photoRewards, InfoHeader, PhasLabel, Separator, info } from "../utils/consts";
// import { JournalLabel } from "../Journal";
import Random from "../../utils/random";
// import { br } from "../utils/utils";
import { difficulties, points, costMult, randomItem, currentEquipment, difficulty, setPoints } from ".";

const tarots = ["Red Wheel of Fortune", "Green Wheel of Fortune", "The Sun", "The Moon", "The Tower", "Hanged Man", "High Priestess", "The Hermit", "Death", "Fool"];
const tarotChances = [20, 20, 5, 5, 20, 1, 2, 10, 10, 0];
const tarotPoints = [25, 25, 40, 40, 20, 0, 0, 40, 25, 0]
const tarotText = ["Points - x", "Points + x", "Points + x", "Points - x", "Points + x, Cost + x%","Points = x", "Item", "Cost - x%", "Points - x, Fool", "Rip"];

const tarotInfo = {};
var fool;

export var tarotRemaining;
export var lastTarot;
export var foolChance;

export function resetTarot() {
    tarotRemaining = 10;
    foolChance = 17;
}

export function incrementTarot() {
    tarotRemaining++;
}

export function setFoolChance(chance) {
    foolChance = chance;
}

export default function TarotCard(props) {
    return (
        <button onClick={props.callback} className={"photo-random-item" + props.className}>Draw Tarot</button>
    )
}

for(let i = 0; i < tarots.length; i++) { createTarot(tarots[i].toLowerCase(), tarotPoints[i], tarotChances[i], tarotText[i]); }

function createTarot(tarot, points, chance, text) {
    tarotInfo[tarot] = {
        chance: chance,
        text: text,
        points: points
    };
}

export function drawTarot() {
    let diffMult = 3 - (difficulties.indexOf(difficulty) + 1);
    let tarot = new Random().randchance(tarots.slice(0, tarots.length - 1), tarotChances.slice(0, tarotChances.length - 1));
    let orig = tarot.slice();
    let tname = tarot.toLowerCase();

    let r = new Random().nextInt(100);

    if(fool || r <= foolChance) {
        tarot = "Fool";
        fool = true;
        foolChance = 17;
    }

    let ppoints = points;
    let cmult = costMult;

    let pointDiff = tarotInfo[tname].points;
    let info = tarotInfo[tname].text;

    let split = info.split(", ");

    let resText = ""
    
    for(let i = 0; i < split.length; i++) {
        let text = split[i];

        let tokens = text.split(" ");

        let action = tokens[0];

        tokens = tokens.slice(1);

        let operation;
        let value;

        if(tokens.length === 2) {
            operation = tokens[0];
            value = tokens[1];
        }

        if(action === "Points") {
            if(tokens.length === 2) {
                let pointsChange;
                let tryNum = parseFloat(value);

                if(value === "x") {
                    pointsChange = pointDiff - (diffMult * 5);
                } else if(!Number.isNaN(tryNum)) {
                    pointsChange = tryNum;
                } else if(value.endsWith("%")) {
                    value = value.replace("%", "");
                    tryNum = parseFloat(value);

                    if(value === "x") {
                        pointsChange = parseFloat(ppoints / 100) * pointDiff;
                    } else if(!Number.isNaN(tryNum)) {
                        pointsChange = (ppoints / 100) * tryNum;
                    }
                }

                if(pointsChange) {
                    ppoints = calc(ppoints, pointsChange, operation);

                    resText += (resText.length === 0 ? "" : ", ");
                    if(!text.includes("%")) resText += text.replace("x", pointsChange.toString());
                    else resText += text.replace("x", pointDiff.toString());
                    
                    if(!text.includes("%")) resText = resText.replace(pointDiff, pointsChange);
                }
            }
        } else if(action === "Cost") {
            if(tokens.length === 2) {
                let costChange;
                let tryNum = parseFloat(value);

                if(value === "x") {
                    costChange = pointDiff;
                } else if(!Number.isNaN(tryNum)) {
                    costChange = tryNum;
                } else if(value.endsWith("%")) {
                    value = value.replace("%", "");
                    tryNum = parseFloat(value);

                    if(value === "x") {
                        costChange = (cmult / 100) * pointDiff;
                    } else if(!Number.isNaN(tryNum)) {
                        costChange = (cmult / 100) * tryNum;
                    }
                }

                if(costChange) {
                    resText += (resText.length === 0 ? "" : ", ");
                    if(!text.includes("%")) resText += text.replace("x", costChange.toString());
                    else resText += text.replace("x", pointDiff.toString());
                    
                    if(!text.includes("%")) resText = resText.replace(pointDiff, costChange);

                    cmult = calc(cmult, costChange, operation);
                    
                }
            }
        } else if(action === "Item") {
            if(tokens.length === 0 ||  tokens[0] === "+") {
                randomItem(true);
                resText += (resText.length === 0 ? "" : ", ") + "Free Item";
            } else if(tokens[0] === "-") {
                currentEquipment.splice(new Random().intFromArray(currentEquipment), 1);
                resText += (resText.length === 0 ? "" : ", ") + "Lose an Item";
            }
        } else if(action === "Fool") {
            fool = true;
            resText += (resText.length === 0 ? "" : ", ") + "Cause Fool Next Time";

        }
    }
    
    //set cmult and ppoints

    tarotRemaining--;

    if(fool && orig !== "Death") {
        lastTarot = "Pulled " + orig + " but it fooled!";
        fool = false;
    } else lastTarot = orig + ": " + resText;

    setPoints(ppoints, costMult);
}

function calc(a, b, op) {
    if(op === "+") {
        a += b;
    } else if(op === "-") {
        a -= b;
    } else if(op === "*") {
        a *= b;
    } else if(op === "/") {
        a /= b;
    } else if(op === "=") {
        a = b;
    }

    return Math.round(a);
}