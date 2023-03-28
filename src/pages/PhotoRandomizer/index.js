import React from "react";
import { equipment, photoRewards, PhasLabel, Separator, info } from "../../utils/consts";
import Random from "../../utils/random";
import TarotCard, { drawTarot, lastTarot, resetTarot, tarotRemaining } from "./TarotCards";
import MonkeyPaw, { getDropdown, hideWishes, resetWishes } from "./MonkeyPaw";

export const difficulties = ["Normal", "Hard"];

var usables = trimAvailable(equipment.slice());
var equipmentList;
export var currentEquipment = [];
export var points, difficulty, remaining;
var stars = 1;
export var costMult;
export var starMult;
export var updateCallback;

var onDifficultyChange, onPhotoReward, onStarChange, onTarotCard;

function trimAvailable(array) {
    for(let i = 0; i < array.length; i++) {
        let e = array[i];

        if(e === "Photo Camera" || e === "Weak Torch" || e === "Lighter") array.splice(i, 1);
    }

    return array;
}

export function randomItem(free=false) {
    free = free === true;
    if(currentEquipment.length === usables.length) return;

    if(difficulty === "Hard") {
        if(points < 5 * costMult && !free) return;
        else if(!free) points -= (5 * costMult);
    }

    if(currentEquipment.length !== usables.length) {
        let randint = new Random().intFromArray(equipmentList);
        let equipment = equipmentList.splice(randint, 1);
        currentEquipment.push(equipment);
    }

    updateCallback();
}

function reset(call=true) { 
    points = 0;
    currentEquipment.splice(0, currentEquipment.length);
    equipmentList = usables.slice();
    remaining = 10;
    costMult = 1;
    starMult = 1;

    resetTarot();
    resetWishes();
    if(call)
        updateCallback();
 }

function getPoints() {
   return (difficulty === "Normal" ? (<>&infin;</>) : points.toString());
}

function getDifficultyExtras() {
    let center = [];
    if(difficulty === "Hard") {
        center.push(<p className="phas-label" key="c2">{"Photos Remaining: " + remaining}</p>)
        center.push(<Separator key="c1"/>);
    }
    return center;
}

class PhotoRandoLabel extends React.Component {
    render() { return (<PhasLabel className={"photo-rando-label " + this.props.className} text={this.props.text}></PhasLabel>); }
}

class PhotoRandoPanelDefs extends React.Component {
    render() {
        return (
            <>
                <button className={this.props.btnClassName + " photo-rando-item"} onClick={randomItem}>Random Item</button>
                <p className="photo-rando-item">{"Difficulty: " + difficulty}</p>
                <input className="photo-rando-item photo-rando-slider" type="range" min="0" max="1" value={difficulties.indexOf(difficulty)}onChange={onDifficultyChange}/>
                <button className="photo-rando-item" onClick={reset}>Reset</button>
            </>
        );
    }
}

class PhotoRandoNormal extends React.Component {
    render() {
        let randomItemBtnClassName = "";

        if(currentEquipment.length === usables.length) randomItemBtnClassName = "disabled";

        return (
            <>
                <div className="btns-left"><br/></div>

                <div className="btns-right">
                    <PhotoRandoPanelDefs btnClassName={randomItemBtnClassName}/>
                </div>
            </>
        )
    }
}



class PhotoRandoHard extends React.Component {
    render() {
        let randomItemBtnClassName = "";
        if(points < 5 || currentEquipment.length === usables.length) randomItemBtnClassName = "disabled";

        let left = [], right = [], oleft = [];

        let tcn = "";
        if(tarotRemaining <= 0)  tcn = " disabled"
       
        right.push(<TarotCard className={tcn} key={"tarotCard"} callback={onTarotCard}></TarotCard>);

        oleft.push(getDropdown());
        left.push(<MonkeyPaw key="drb"/>);


        left.push(<button className="journal-blank photo-rando-slider-b" key={"lbe"}>av</button>);
        right.push(<button className="journal-blank photo-rando-slider-b" key={"rbe"}>av</button>);

        for(let i = 0; i < photoRewards.length; i++) (i % 2 === 0 ? left : right).push(<button onClick={onPhotoReward} className={"photo-rando-item"} key={i}>{photoRewards[i]}</button>)

        for(let i = 0; i < 6; i++) {
            if(i === 1 || i === 4) oleft.push(<p className="photo-rando-item journal-blank" key={i + "be"}>ab</p>);
            else if(i === 2 || i === 5) oleft.push(<button className="journal-blank photo-rando-slider-b" key={i + "be"}>av</button>);
            else oleft.push(<button className="photo-rando-item journal-blank invis" key={i + "vg"}>vg</button>);
        }

        oleft = oleft.concat(left);

        return (
            <>
                <div className="btns-left">{oleft}</div>

                <div className="btns-right">
                    <PhotoRandoPanelDefs btnClassName={randomItemBtnClassName}/>
                    <p className="photo-rando-item">{"Stars: " + stars}</p>
                    <input className="photo-rando-item photo-rando-slider" type="range" min="1" max="3" value={stars} onChange={onStarChange}/>
                    {right}
                </div>
            </>
        )
    }
}


function getPanel() {
    switch(difficulty) {
        case "Hard": return <PhotoRandoHard/>
        default: return <PhotoRandoNormal/>
    }
}

export function setStarMult(sm) { starMult = sm; }

export function setRemaining(rem) { remaining = rem; }

export function setPoints(p, cm) {
    points = p;
    costMult = cm;
}
class PhotoRandomizer extends React.Component {

    constructor(props) {
        super(props);

        difficulty = "Normal";
        updateCallback = this.forceUpdate.bind(this);
        onDifficultyChange = this.onDifficultyChange.bind(this);
        onPhotoReward = this.onPhotoReward.bind(this);
        onStarChange = this.onStarChange.bind(this);
        onTarotCard = this.onTarotCard.bind(this);

        reset(false);
    }

    render() {
        hideWishes();

        let center = [];
        let str = "";

        for(let i = 0; i < currentEquipment.length; i++) {
            if(i !== 0 && i % 3 === 0) {
                center.push(<PhotoRandoLabel key={i + "-x"} text={str}/>);
                str="";
            }
            str += (str.length === 0 ? "" : ", ") + currentEquipment[i];
        }
    
        if(str) center.push(<PhotoRandoLabel key={"g-x"} text={str}/>);

        let end = Math.ceil((usables.length - currentEquipment.length) / 3);

        for(let i = 0; i < end; i++) {
            center.push(<PhotoRandoLabel key={"x" + i + "-x"} text={"______"} className={"journal-blank"}/>);
        }

        let footerText = "Photo Camera, Weak Torch and Lighter always available";

        if(lastTarot) {
            footerText = lastTarot;
            // lastTarot = "";
        }
        
        return (
            <div className="wrapper">       
                <div className="sub-wrapper">
                    <div className="photo-rando-wrapper">
                        <div className="jtop">
                            <Separator/>
                            <p className="phas-label">{"Points: "}{getPoints()}</p>
                            <Separator/>
                            {getDifficultyExtras()}
                        </div>

                        <div className="jcenter">{center}</div>

                        <div className="jbottom">
                            <Separator/>
                            <PhotoRandoLabel key="-h" text={footerText}/>
                        </div>
                    </div>
                </div>

                {getPanel()}                
            </div>
        )
    }

    onDifficultyChange(e) {
        let index = e.target.value;

        let newDifficulty = difficulties[index];

        if(newDifficulty !== difficulty) {
            difficulty = newDifficulty;

            reset();
        }
    }

    onStarChange(e) {
        stars = e.target.value;

        this.forceUpdate();
    }

    onPhotoReward(e) {
        if((remaining <= 0)) return;

        let values = info[e.target.textContent];

        points += values[stars - 1] * starMult;

        remaining--;

        this.forceUpdate();
    }

    onTarotCard() {
        if(tarotRemaining <= 0) return;

        drawTarot();

        this.forceUpdate();
    }
}



export default PhotoRandomizer;