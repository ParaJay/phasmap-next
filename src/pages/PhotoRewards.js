import React from "react";
import { info, InfoHeader, photoRewards } from "../utils/consts";

export default function PhotoRewards() {
    const groups = {};


    for(let i = 0; i < photoRewards.length; i++) {
        let photo = photoRewards[i];

        let reward = info[photo];

        if(groups[reward] === undefined) groups[reward] = reward;

        groups[reward] += ", " + photo;
    }

    let text = "";

    let keys = Object.keys(groups);

    for(let i = 0; i < keys.length; i++) {
        let key = groups[keys[i]];
        let split = key.split(", ");
        let vals = split[0];
        let photos = key.split(vals + ", ")[1].split(", ");

        let ksplit = keys[i].split(",");
        let kkey = "1 Star: $" + ksplit[0] + ", 2 Star: $" + ksplit[1]  + ", 3 Star: $" + ksplit[2];

        text += text === "" ? "" : "\n\n"
        text += (kkey + ":\n\t" + photos.toString().replaceAll(",", ", "));
    }

    return (
        <div className="wrapper">       
            <div className="info-wrapper">
                <InfoHeader text="Photo Rewards"></InfoHeader>
                <textarea type="text" id="text" cols="108" rows="32" readOnly={true} value={text}></textarea>
            </div>
        </div>
    )
}