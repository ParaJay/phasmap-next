import { evidenceMap, ghosts, info, PhasLabel } from "@/utils/consts";
import { handleKeyDown, initKeyValues, initKeys, capitalize, br } from "@/utils/utils.js";
import { useEffect, useState } from "react";
import Link from "next/link";
import Button from '@mui/material/Button';

//TODO: persist slider
const actions = {"strike":strike, "reset":reset};

//TODO: don't allow keybinds if slider is focused

const defaultSX = {
    color: "inherit",
    bgcolor: "rgb(78, 80, 82)",
    borderColor: "rgb(94, 97, 98)",
    padding: "5px 4px",
    borderRadius: "12%",
    margin: "6px",
    minWidth: "88%"
};

const br2 = br(2);
var sani = 0;
var selected, nightmare, insanity;
var updateCallback, exclusionCallback, labelCallback;
const difficulties=["nightmare", "insanity"];
const selections={}, exclusions={}, evidence={}, striked={}, sanity={}, permanentEvidence={}, autoExcluded=[];

function getPossibleGhosts(ret=3) {
    let first = [], second = [], third = [];

    first = applySelectionFilter();

    if(ret === 1) return first;

    second = applyExclusionFilter(first);

    if(ret === 2) return second;

    third = applySanityFilter(second);
    third = applyDifficultyFilters(third);

    if(third.length === 0) third.push("None");

    return third;
}

function applySelectionFilter() {
    let res = [];
    let evs = Object.keys(evidenceMap).filter(e => selections[e]);

    if(evs.length > 0) {
        ghosts.forEach(ghost => {
            let evi = evidence[ghost];
            let pass = true;

            if(!evi) return;

            evs.forEach(e => {
                if(!evi.includes(evidenceMap[e])) pass = false;
            });

            if(pass && !res.includes(ghost)) res.push(ghost);
        });
    } else {
        res = ghosts.slice();
    }

    return res;
}

function applyExclusionFilter(array, exc=Object.keys(evidenceMap).filter(e => exclusions[e])) {
    let res = [];

    if(exc.length > 0) {
        array.forEach(ghost => {
            let pass = true;

            for(let i = 0; i < exc.length; i++) {
                let e = exc[i];
                if(evidence[ghost].includes(evidenceMap[e])) {
                    pass = false;
                    break;
                }
            };

            if(pass && !res.includes(ghost)) res.push(ghost);
        });
    } else {
        res = array.slice();
    }

    return res;
}

function applySanityFilter(array) { return array.filter(e => sanity[e] >= sani); }
function applyNightmareFilter(array) { return nightmare ? difficultyCheck(array, 2, 1) : array; }
function applyInsanityFilter(array) { return insanity ? difficultyCheck(array, 1, 2) : array; }
function applyDifficultyFilters(array) { return applyInsanityFilter(applyNightmareFilter(array)); }

function difficultyCheck(third, max, off) {
    let count = countSelections();

    let rem = [];

    if(count > max && !third.includes("The Mimic")) {
        third = [];
    } else {
        for(let i = 0; i < third.length; i++) {
            let ghost = third[i];

            if(ghost !== "The Mimic" && count > max) {
                rem.push(ghost);
            } else {
                let size = evidence[ghost].length;

                if(count >= size - off) {                       
                    if(permanentEvidence[ghost]){
                        let ps = selections[reverseCheck(permanentEvidence[ghost])] === true;

                        if(!ps) rem.push(ghost);
                    }
                }
            }
        }
    }

    for(let i = 0; i < rem.length; i++) third.splice(third.indexOf(rem[i]), 1);

    return third;
}

function reverseCheck(checkFor) {
    let keys = Object.keys(evidenceMap);

    for(let i = 0; i < keys.length; i++) if(evidenceMap[keys[i]] === checkFor) return keys[i];

    return null;
}

function countSelections() {
    let count = 0;
    let keys = Object.keys(selections);

    for(let i = 0; i < keys.length; i++) if(selections[keys[i]] === true) count++;

    return count;
}

function goto() {
    if(!selected) return;

    if(typeof window === "undefined") return;

    window.location.href = window.location.href.split("/")[0] + "?ghost=" + selected.replaceAll(" ", "%20") + "#/ghosts";
}

function strike() {
    if(!selected) return;

    striked[selected] = !striked[selected];

    updateExclusions();
}

function reset() { if(typeof window === "undefined") return; window.location.reload(); }

function l(t, k=t) { return <JournalLabel onClick={labelCallback} key={k} text={t}></JournalLabel>; }

function updateExclusions() {
    let keys = Object.keys(evidenceMap);

    for(let i = 0; i < keys.length; i++) {
        if(!isPossible(keys[i])) {
            exclusions[keys[i]] = true;
            autoExcluded.push(keys[i]);
        } else {
            while(autoExcluded.includes(keys[i])) {
                exclusions[keys[i]] = false;
                autoExcluded.splice(autoExcluded.indexOf(keys[i]), 1);
            }
        }
    }

    updateCallback();
}

function isPossible(evi) {
    let found = [];
    let ghosts = applySanityFilter(getPossibleGhosts(1)).slice();

    if(ghosts.length === 0 || ghosts[0] === "None") return true;

    let count = countSelections();

    for(let i = 0; i < ghosts.length; i++) {
        if(!found.includes(ghosts[i]) && evidence[ghosts[i]].includes(evidenceMap[evi])) found.push(ghosts[i]);
        if(found.includes(ghosts[i]) && striked[ghosts[i]]) found.splice(found.indexOf(ghosts[i]), 1);

        for(let j = 0; j < 2; j++) {
            let b = j === 0 ? nightmare : insanity;

            if(found.includes(ghosts[i]) && count > evidence[ghosts[i]].length - (j + 1) && b) found.splice(found.indexOf(ghosts[i]), 1);

            if(found.includes(ghosts[i]) && count === evidence[ghosts[i]].length - (j + 1) && b) {
                if(permanentEvidence[ghosts[i]]) {
                    if(selections[reverseCheck(permanentEvidence[ghosts[i]])] === false) found.splice(found.indexOf(ghosts[i]), 1);
                } else {
                    if(!evidence[ghosts[i]].includes(evidenceMap[evi])) found.splice(found.indexOf(ghosts[i]), 1);
                }
            }
    
        }
    }
    
    return found.length > 0;
}

function Slider(props) {
    return <input id="slider" defaultValue="0" type="range" min="0" max="100" value={props.val} onInput={props.callback}/>;
}



export function JournalLabel(props) {
    let text = props.text;
    let cn = "journal-defs journal-";

    if(selected === text) cn += "selected";
    
    if(striked[text]) cn = cn.replace("selected", "") + "striked";

    if(cn.endsWith("-")) cn += text.endsWith("_") ? "blank" : "label";

    let tip = "";

    if(evidence[text]) tip = evidence[text].toString().replaceAll(",", ", ")

    return (
        <PhasLabel onClick={props.onClick} text={props.text} className={cn} tooltip={tip}></PhasLabel>
    )
}

function CheckBoxLabel(props) {
    let f = props.htmlFor
    let text = props.text;
    if(exclusions[f]) text += " (NOT)";

    return <label className="journal-check-label grounded-item-right" htmlFor={f} onMouseUp={(e) => {
        if(e.button === 1 && evidenceMap[f]) exclusionCallback(e);
    }}>{text}</label>
}

function ActionButton(props) {
    let action = props.action;

    return(
        <>
            <br/>
            <Button id={action} onClick={actions[action]} sx ={defaultSX}>
                {capitalize(action)}
            </Button>
        </>
    )
}

export default function Journal() {
    const [loaded, setLoaded] = useState(false);
    const [random, setRandom] = useState(0);

    updateCallback = forceUpdate;
    exclusionCallback = onExclusionSwitch;
    labelCallback = onSelectionChange;

    var shifting = false;

    function CheckBox(props) {
        let check = (<input type="checkbox" id={props.id} className="evidence grounded-item" value={props.value} onClick={onEvidenceChange} 
        onMouseUp={(e) => { if(e.button === 1) exclusionCallback(e); }} defaultChecked={selections[props.id] && !exclusions[props.id]}/>);
    
        if(!checks.includes(check.id)) checks.push(check.id);
    
        return check;
    }

    function forceUpdate() {
        let rand = random;

        while(random === rand) rand = Math.random();
        setRandom(rand);
    }

    function keyUp(e) {
        if(!e.shiftKey && !e.ctrlKey) shifting = false;

        if(e.key === " ") strike();
    }

    function keyDown(e) {
        if(e.shiftKey || e.ctrlKey) shifting = true;

        let ghosts = getPossibleGhosts().slice();

        initKeyValues(ghosts.length > 12 ? 2 : 1);

        let sel = handleKeyDown(e, ghosts, selected);

        if(sel) {
            selected = sel;
            forceUpdate();
        }
    }

    function onNightmareChange(e) {
        nightmare = e.target.checked;
        updateExclusions();
    }

    function onInsanityChange(e) {
        insanity = e.target.checked;
        updateExclusions();
    }

    function onEvidenceChange(e) {
        let check = e.target;

        if(shifting) {
            onExclusionSwitch(e);
        } else {
            if(exclusions[check.id]) return;
            if(check.checked === true) selections[check.id] = true;
            else delete selections[check.id];
        }

        updateExclusions();
    }

    function onExclusionSwitch(e) {
        let id = e.target.id ? e.target.id : e.target.htmlFor;

        if(selections[id]) selections[id] = false;

        exclusions[id] = !exclusions[id];

        updateExclusions();
    }

    function onSanityChange(e) {
        sani = e.target.value;
        updateExclusions();
    }

    function onSelectionChange(e) {
        selected = e.target.textContent;
        forceUpdate();
    }

    console.log("pre-effect");

    useEffect(() => {
        if(!loaded) {
            initKeys(ghosts);

            for(let i = 0; i < ghosts.length; i++) {      
                let e = info[ghosts[i]]; 
                if(!e) break;
                let lines = e.split("\n");

                for(let j = 0; j < lines.length; j++) {
                    let line = lines[j];

                    if(line.includes("Evidence: ")) evidence[ghosts[i]] = line.split(": ")[1].split(", ");

                    if(line.includes("Always gives") && line.includes("evidence in Nightmare")) permanentEvidence[ghosts[i]] = line.split("gives ")[1].split(" evidence")[0];

                    if(line.includes("Hunts from: ")) {
                        let split = line.split("Hunts from: ")[1].split(" ");

                        let san = 0;

                        split.forEach(ee => {
                            if(ee.includes("%")) {
                                let si = parseInt(ee.replace("%", "").replace("(", ""));

                                if(si > san) san = si;
                            }
                        });

                        sanity[ghosts[i]] = san;
                    }
                }
            }

            setLoaded(true);
        }

        document.addEventListener("keydown", keyDown, false);
        document.addEventListener("keyup", keyUp, false);

        return () => {
            document.removeEventListener("keydown", keyDown, false);
            document.removeEventListener("keyup", keyUp, false);
        };
    });

    if(!loaded) return <p>Loading...</p>

    let possibleGhosts = getPossibleGhosts().slice();

    let left = [], right = [], center = [], checks = [], labels = [], actionButtons = [], difficultyLabels = [];

    possibleGhosts.map((ghost, index) => {
        let lbl = l(ghost);

        if(possibleGhosts.length > 12) {
            (index % 2 === 0 ? left : right).push(lbl);
        } else {
            center.push(lbl);
        }
    });

    Object.keys(evidenceMap).map((key) => {
        let value = evidenceMap[key];

        if(!value) value = capitalize(key);

        checks.push(<CheckBox key={key} id={key} value={value}/>);  
        labels.push(<CheckBoxLabel key={"l-" + key} htmlFor={key} text={value}/>);
    });

    let actionKeys = Object.keys(actions);

    actionButtons.push(
        <div key="goto">
            <Button component={Link} href={"../Ghosts/" + (selected ? selected : "")} color="inherit"
                onClick={(e) => {
                    if(!selected) e.preventDefault();
                }}
                sx ={defaultSX}
            >
                Goto
            </Button>
        </div>
    )

    for(let i = 0; i < actionKeys.length; i++) actionButtons.push(<ActionButton key={"act" + i} action={actionKeys[i]}/>)
    for(let i = 0; i < difficulties.length; i++) difficultyLabels.push(<CheckBoxLabel key={i} htmlFor={difficulties[i]} text={capitalize(difficulties[i] + "?")}></CheckBoxLabel>)

    let difficultyChecks = [
        <input type="checkbox" key="n" id={"nightmare"} onChange={onNightmareChange}></input>,
        <input type="checkbox" key="i" id={"insanity"} onChange={onInsanityChange}></input>
    ];

    return (
        <div className="journal-wrapper">
            <div className="sub-wrapper">
                <div className="journal-wrapper">
                    <div className="grounded-center-left">{left}</div>
                    <div className="grounded-center">{center}</div>
                    <div className="grounded-center-right">{right}</div>
                </div>
            </div>

            <div className="grounded-wrapper">
                <div className="grounded-left">
                    {checks}
                    {br2}
                    <label className="grounded-item-left sanity-label" htmlFor="slider" id="sliderLabel">Sanity: {sani}%</label>
                    {br2}
                    {difficultyChecks}
                                
                </div>
                
                <div className="grounded-right">
                    {labels}
                    {br2}
                    <Slider callback={onSanityChange}/>
                    {br2}
                    {difficultyLabels}
                    <br/>
                    {actionButtons}
                </div>           
            </div>
        </div>
    )
}