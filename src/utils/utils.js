var keys = {};

export var info, kval;

export function initKeyValues(kvalMax=2) { kval = {ArrowUp:-kvalMax, ArrowDown:kvalMax, ArrowLeft: -1, ArrowRight: 1}; }

export function initInfoState(array) {
    initKeyValues(2);

    initKeys(array);
}

export function initAll(array) { initKeys(array); }

export function initKeys(array) {
    keys = {};

    for(let i = 0; i < array.length; i++) {
        let item = array[i];

        let split = item.replaceAll("_", " ").split(" ");
        let val = [];

        split.forEach(e => val.push(e.charAt(0).toUpperCase()));

        keys[item] = val;
    }
}

export function setInfo(i) { info = i; }

function arrayToString(arr) {
    let res = "";

    for(let i = 0; i < arr.length; i++) {
        res += ((res.length == 0 ? "" : "\n") + arr[i]);
    }

    return res;
}

export function readInfo(filename, dir) {
    filename = filename.toLowerCase().replaceAll(" ", "");

    let e = require(`../../res/${dir}/${filename}.json`);

    return arrayToString(e.info);
}

function getFromKey(key) {
    let res = [];
    let okeys = Object.keys(keys);

    for(let i = 0; i < okeys.length; i++) {
        let okey = okeys[i];
        let val = keys[okey];

        if(val.includes(key)) res.push(okey);
    }

    return res;
}

export function handleKeyDown(e, array, sel) {
    if(!kval) initKeyValues();

    let key = e.key;
    let am = kval[key];
    let s = am ? getNext(array, am, sel) : handleKey(key, sel);

    return s;
}

export function handleKey(key, sel) {
    if(key.length !== 1) return;
    if(!key.match("[a-zA-Z]")) return;

    let array = getFromKey(key.toUpperCase());

    if(array.length === 0) return;

    if(array.length === 1) {
        return array[0];
    }

    let index = array.indexOf(sel) + 1;

    if(index === array.length) index = 0;

    return array[index];
}

export function getNext(array, am, sel) {
    let index = array.indexOf(sel);

    if(sel) {
        for(let i = 0; i < Math.abs(am); i++) {
            let ii = am < 0 ? -1 : 1;

            index += ii;

            if(index === array.length) index = 0;

            if(index < 0) index = array.length - 1;
        }
    } else {
        index = 0;
    }

    return array[index];
}

export function capitalize(string) { return (string.charAt(0).toUpperCase() + string.slice(1)); }

export function capitalizeAll(string, seperator=" ") {
    if(!string.includes(seperator)) return capitalize(string);

    let split = string.split(seperator);
    let res = "";

    for(let i = 0; i < split.length; i++) res += (res.length === 0 ? "" : seperator) + capitalize(split[i]);

    return res;
}

export function capitalizeArrayToString(array, start=0, seperator="") {
    let result = "";

    if(start !== 0) result = array.slice(0, start).toString().replaceAll(",", seperator);

    for(let i = start; i < array.length; i++) {
        let e = array[i];

        if(result.length > 0) result += seperator;

        result += capitalize(e);
    }

    return result;
}

export function capitalizeInArray(arr, start=0, end=arr.length, seperator="") {
    let array = arr.slice();
    for(let i = start; i < end; i++) array[i] = capitalizeAll(array[i], seperator);
    return array;
}

export function toSafeString(str) {
    return str.toLowerCase().replaceAll(" ", "_");
}

export function toUnsafeString(str) {
    return capitalizeArrayToString(str.replaceAll("_", " ").split(" "), 0, " ");
}

export function toSafeArray(arr) {
    let array = arr.slice();
    for(let i = 0; i < array.length; i++) array[i] = toSafeString(array[i]);
    return array;
}

export function toUnSafeArray(arr) {
    let array = arr.slice();
    for(let i = 0; i < array.length; i++) array[i] = toUnsafeString(array[i]);
    return array;
}

export function br(amount=1) {
    let res = [];

    for(let i = 0; i < amount; i++) res.push(<br key={i}/>);

    return res;
}