import { handleKeyDown, initKeys, initKeyValues, getNext } from "../../../utils/utils.js";
import React, {useEffect, useState} from "react";
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch"
import { maps } from "../../../utils/consts.js";
// import { useNavigate, useParams } from "react-router-dom";
import { useRouter } from "next/router.js";
import Nav from "@/components/Nav.js";

const current = [];

export default function Map () {
    const [loaded, setLoaded] = useState(false);
    const [image, setImage] = useState();
    // const {selection} = useParams();

    // if(!selection) return <></>

    const [random, setRandom] = useState(0);
    const router = useRouter();
    const map = router.query.map;

    function forceUpdate() {
        let r = random;

        while(r === random) r = Math.random();

        setRandom(r);
    }

    function Button(props) { return <button onClick={props.onclick}>{props.text}</button> }

    function init() {
        initKeyValues(1);
        initKeys(maps);
    }
    
    function select(map) {
        map = map.toLowerCase().replaceAll(" ", "_");

        current[0] = map;

        router.push("/Maps/" + map);

        // forceUpdate();
    }

    function change(am) {
        let s = getNext(maps, am, current[0]);
    
        if(s) select(s);
    }

    function keyDown(e) {
        let s = handleKeyDown(e, maps, current[0]);

        if(s) select(s);
    }

    useEffect(() => {
        async function getImage() {
            let e = require("../../../../res/maps/" + current[0] + ".png");

            setImage(e.default.src);
        }

        if(!loaded) {
            init();

            setLoaded(true);

            if(!current[0]) select("camp_woodwind");
        }

        if(map) select(map);

        getImage();

        document.addEventListener("keydown", keyDown, false);

        return () => {
            document.removeEventListener("keydown", keyDown, false);
        }
    }, [current[0], map]);

    return (
        <div className="img-wrapper" onKeyDown={keyDown}>
            <div className="centered">
                <TransformWrapper id="centered">
                    <TransformComponent id="centered">
                        <img id="phas-image" src={image} alt="oops" width="600" height="400"></img>
                    </TransformComponent>
                </TransformWrapper>
            </div>

            <div className="wrapper">
                <Button onclick={() => {
                    change(-1);
                    }} text={"Previous"}></Button>

                <Button onclick={() => {
                    change(1); 
                    }} text={"Next"}></Button>

                <div className="grounded-center-row">
                    <br/>all map images from:&nbsp;
                    <a href="https://imgur.com/a/iEI0tJo"><br/>here</a>
                    <br/>&nbsp;made&nbsp;
                    <a href="https://www.reddit.com/user/Fantismal/"><br/>by</a>
                </div>
            </div>
        </div>
    )
}