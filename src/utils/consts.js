import { capitalizeAll, readInfo, toUnSafeArray } from "./utils";
import React from "react";
import { Tooltip } from "@mui/material";

export const maps = [
    "bleasedale", "brownstone_high_school", "camp_woodwind", "edgefield", "grafton", "maple_lodge_campsite", "prison", 
    "ridgeview", "sunny_meadows", "sunny_meadows_restricted", "tanglewood", "willow"
]

export const unsafe_maps = toUnSafeArray(maps);

export const ghosts = [
    "Banshee", "Demon", "Deogen", "Goryo", "Hantu", "Jinn", "Mare", "Moroi", "Myling",
    "Obake", "Oni", "Onryo", "Phantom", "Poltergeist", "Raiju", "Revenant", "Shade",
    "Spirit", "Thaye", "The Mimic", "The Twins", "Wraith", "Yokai", "Yurei"
]

export const evidenceMap = {
    orbs: "Ghost Orbs",
    fingerprints: "Fingerprints",
    dots: "D.O.T.S",
    freezing: "Freezing",
    spiritBox: "Spirit Box",
    emf: "EMF 5",
    writing: "Ghost Writing"
};

export const equipment = [
    "DOTS Projector", "EMF Reader", "Ghost Writing Book", "Photo Camera", "Spirit Box", "UV Torch", "Video Camera",
     "Candle", "Crucifix", "Glowstick", "Head Mounted Camera", "Lighter", "Motion Sensor", "Parabolic Microphone", "Salt",
      "Sanity Pills", "Smudge Sticks", "Sound Sensor", "Strong Torch", "Thermometer", "Tripod", "Weak Torch"];

export const cursedItems = ["Haunted Mirror", "Monkey Paw", "Music Box", "Ouija Board", "Summoning Circle", "Tarot Cards", "Voodoo Doll"];
export const difficulties = ["Amateur", "Intermediate", "Professional", "Nightmare", "Insanity"];

export const photoRewards = [
    "Ghost", "Cursed Item", "Fingerprint", "Footprints", "Interaction", "Dead Body", "Ghost Writing", "Salt Pile", "DOTS", "Bone", "Dirty Water", "Used Crucifix"
];

var loading = false;

export const info = {};

export async function initInfo() {
    if(Object.keys(info).length > 0) return;
    if(loading) return;

    loading = true;

    let data = await fetch("https://eu-west-1.aws.data.mongodb-api.com/app/data-kfohd/endpoint/PhasMap/G");
    let json = await data.json();

    loadGhosts(json.ghosts);
    loadBasic(json.curseditems);
    loadBasic(json.equipment);
    loadBasic(json.difficulties, true);

    parse("photorewards", "photorewards");

    loading = false;
}

function loadGhosts(ghosts) {
    for(let i = 0; i < ghosts.length; i++) {
        let ghost = ghosts[i];
        let inf = ghost.info;
        let hmin = ghost.hunt_min + "%";
        let hmax = ghost.hunt_max + "%";
        let hminr = ghost.hunt_min_reason;
        let hmaxr = ghost.hunt_max_reason;

        if(hminr) hmin += (" (" + hminr + ")");
        if(hmaxr) hmax += (" (" + hmaxr + ")");

        let huntInfo = hmin === hmax ? hmin : hmin + " - " + hmax;

        inf.unshift("");
        inf.unshift("Hunts from: " + huntInfo);
        inf.unshift("");
        inf.unshift("Evidence: " + ghost.evidence.toString().replaceAll(",", ", "));       

        register(ghost.name, inf);
    }
}

function loadBasic(objs, nosplit=false) {
    for(let i = 0; i < objs.length; i++) {
        let obj = objs[i];
        let inf = obj.info;

        let res = arrayify(obj, nosplit);

        if(inf !== undefined) res = res.concat(inf);

        register(obj.name, res);
    }
}

function register(name, inf) {
    let data = "";

    inf.forEach((e) => {
        data += (data.length > 0 ? "\n" : "") + e;
    });

    info[name] = data;
}

function arrayify(obj, nosplit=false) {
    let keys = Object.keys(obj);
    let res = [];

    for(let i = 0; i < keys.length; i++) {
        let key = keys[i];

        if(key.startsWith("_") || key === "info" || key === "name") continue;

        if(res.length > 0 && !nosplit) res.push("");
        res.push(capitalizeAll(key, "_").replaceAll("_", " ") + ": " + boolToYN(obj[key]));
    }

    return res;
}

function boolToYN(bool) {
    if(bool === true) return "Yes";
    if(bool === false) return "No";
    return bool;
}

function isDeclaration(line) {
    return line.match(/@dec [a-zA-Z]* = \([0-9]*, [0-9]*, [0-9]*\)/g);
}

function isSetInfo(line) {
    return line.match(/setInfo "[a-zA-Z ]*" [a-zA-Z]*/g);
}

function isSetMult(line) {
    return line.match(/setMult [a-zA-Z] ["[a-zA-Z ]*"]*/g);
}

function parse(el, dir) {
    let e = readInfo(el.toLowerCase().replaceAll(" ", ""), dir)
    let lines = e.replaceAll("\r", "\n").replaceAll("\n\n", "\n").split("\n");
    let olines = lines.slice();
    let decs = {};

    for(let i = 0; i < olines.length; i++) {
        let line = olines[i];
        
        if(isDeclaration(line)) {
            let split = line.split(" = (");
            let pre = split[0].split("@dec ")[1];
            let value = split[1].replace(")", "").split(", ");

            if(value.length > 1) {
                for(let j = 0; j < value.length; j++) {
                    let v = value[j];

                    let tryInt = parseFloat(v);

                    if(Number.isNaN(tryInt)) {
                        v = v.toString();
                    } else {
                        v = tryInt;
                    }

                    value[j] = v;
                }
            } else {
                let tryInt = parseFloat(value);

                if(Number.isNaN(tryInt)) {
                    value = value.toString();
                } else {
                    value = tryInt;
                }
            }

            decs[pre] = value;

            lines.splice(lines.indexOf(line), 1);
        }
    }

    for(let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if(!line) continue;

        if(isSetInfo(line)) {
            line = line.replace("setInfo ", "");
            let split = line.split("\"");

            let key = split[1].trim();
            let value = split[2].trim();


            if(decs[value]) value = decs[value];

            info[key] = value;
        }

        if(isSetMult(line)) {
            line = line.replace("setMult ", "");

            let split = line.split("\"");

            let key;
            let def = split[0].trim();

            for(let j = 1; j < split.length; j++) {
                key = split[j].trim();

                if(!key) continue;

                if(decs[def]) def = decs[def];

                let values = key.split("\" ");
    
                for(let k = 0; k < values.length; k++) {
                    let v = values[k];
                    let trimmed = v.replaceAll("\"", "").trim();

                    if(trimmed) {
                        key = trimmed;

                        info[key] = def;
                    }
                }
            }              
        }
    }
}

export function isLoading() { return loading; }

export function InfoHeader(props) {
    return (<p id="infoHeader">{props.text}</p>);
}

export function PhasLabel(props) {
    let text = props.text;
        
    return (
        <>
            <Tooltip title={props.tooltip} placement="top">
            <p className={props.className} id={text} value={text} onClick={props.onClick}>{text}</p>
            </Tooltip>
            
        </>
    )
}

export function Separator() {
    return <p className="separator">====================================</p>
}