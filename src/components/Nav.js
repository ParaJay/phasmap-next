import React from "react";
import Link from "next/link";
import {unsafe_maps} from "../utils/consts";

export default function Nav() {
    const maps = unsafe_maps;

    const pages = ["Ghosts", "Maps", "Journal", "Cursed Items", "Equipment", "Difficulty", "Photo Randomizer", "Photo Rewards"]

    let hamburger = require("../../res/hamburger.png");

    return (
        <nav id="nav" className="navbar">
            <div className="dropdown">
                <img className="nav-icon" src={hamburger.default.src}/>

                <div className="dropdown-content">
                    {
                        pages.map((page) => {
                            return <Link key={page} href={"../" + page.replaceAll(" ", "")}>{page}</Link>
                        })
                    }
                </div>
            </div>
            
            <div className="dropdown">
                <button className="dropbtn">View Map</button>
                
                <div className="dropdown-content">{
                    maps.map((map) => {
                        let p = "../Maps/" + map;

                        return(<Link key={map} href={p}>{map}</Link>)
                    })
                }</div>
            </div>
        </nav>
    )
}