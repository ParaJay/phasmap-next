import { initInfoState, handleKeyDown, capitalize, capitalizeAll } from "../utils/utils.js";
import React, {useState, useEffect} from "react";
import { info, InfoHeader, initInfo } from "../utils/consts.js";
import { Tooltip } from "react-tooltip";
import { Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router.js";

const current = {}

function InfoButton(props) {
    let cn = props.selected === props.text ? "orange" : "inherit";
    let title = props.title;
    let text = props.text;
    return (
        <>
            <Button component={Link} href={"/" + capitalizeAll(title) + "/" + text}className={cn} id={text} onClick={() => {
                props.callback(text);
            }}
            data-tooltip-id={text}
            // data-tooltip-html={info[text].replaceAll("\n", "<br/>")}
            sx ={{
                color: cn,
                bgcolor: "rgb(78, 80, 82)",
                borderColor: "rgb(94, 97, 98)",
                padding: "5px 4px",
                borderRadius: "12%",
                margin: "4px 6px",
                textAlign: "center",
                fontSize: "13px",
                width: "200px"
                // width: "100%",

            }}
            >{text}</Button>

            <Tooltip id={text} title="he"/>
        </>
    )
}

export default function Info(props) {
    const [random, setRandom] = useState(0);
    const [init, setInit] = useState(false);

    const title = props.title;

    const array = props.array;

    if(props.selected) {
        current[title] = props.selected;
    }

    console.log("Selected: " + props.selected);
    console.log(current[title]);

    function forceUpdate() {
        let r = random;

        while(r === random) r = Math.random();

        setRandom(r);
    }

    function select(sel) {
        current[title] = sel;
    }

    function keyDown(e) {
        let selected = handleKeyDown(e, array, current[title]);

        select(selected);

        if(props.callback) {
            props.callback(selected);
        }
    }

    useEffect(() => {
        if(!init) {
            initInfoState(array, title);
            setInit(true);
        }

        if(Object.keys(info).length == 0) {
            initInfo();
        }

        document.addEventListener("keydown", keyDown, false);

        if(!current || !current[title]) select(props.array[0]);

        // select(props.selected);

        // select(props.selected);

        // if(props.selected) select(props.selected)
        // else select(current[title]);

        return () => { document.removeEventListener("keydown", keyDown, false); }
    }, [current[title]]);

    let left = [], right = [];

    for(let i = 0; i < array.length; i++) {
        let button = <InfoButton key={array[i]} title={title} text={array[i]} callback={select} selected={current[title]}></InfoButton>;

        if(array.length > 12) {
            (i % 2 === 0 ? left : right).push(button);
        } else {
            left.push(button);
        }
    }

    console.log(info);

    return (
        <div className="wrapper">       
            <div className="col-wrapper">
                    <InfoHeader text={current[title]}></InfoHeader>
                    <textarea id="text" cols="108" rows="32" readOnly={true} value={info[current[title]]}></textarea>
                </div>

                <div className="wrapper">
                    <div className="btns-left">
                        <br/><br/><br/><p className="breaker"/>
                        {left}
                    </div>

                    <div className="btns-right">
                        <br/><br/><br/><p className="breaker"/>
                        {right}
                    </div>
                </div>
        </div>
    )
}