import { initInfoState, handleKeyDown, capitalize } from "../utils/utils.js";
import React, {useState, useEffect} from "react";
import { info, InfoHeader, initInfo } from "../utils/consts.js";
import { Button, Tooltip } from "@mui/material";
import Link from "next/link";

const current = {}

function InfoButton(props) {
    let cn = props.selected === props.text ? "orange" : "inherit";
    let title = props.title;
    let text = props.text;
    return (
        <Tooltip title={text} placement="top">
            <Button component={Link} href={"/" + capitalize(title) + "/" + text}className={cn} id={text} onClick={() => {
                props.callback(text);
            }}
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
            >{text}
            
            </Button>
        </Tooltip>
    )
}

export default function Info(props) {
    const [init, setInit] = useState(false);

    const title = props.title;

    const array = props.array;

    if(props.selected) {
        current[title] = props.selected;
    }

    function select(sel) {
        current[title] = sel;
    }

    function keyDown(e) {
        let selected = handleKeyDown(e, array, current[title]);

        select(selected);
    }

    useEffect(() => {
        if(!init) {
            initInfoState(array, title);
            setInit(true);
        }

        if(Object.keys(info).length == 0) {
            initInfo();
            setInit(true);
        }

        document.addEventListener("keydown", keyDown, false);

        if(!current || !current[title]) select(props.array[0]);

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

    return (
        <div className="wrapper">       
            <div className="col-wrapper">
                    <InfoHeader text={current[title]}></InfoHeader>
                    <textarea id="text" cols="108" rows="32" readOnly={true} value={info[current[title]]}></textarea>
                </div>

                <div className="wrapper">
                    <div className="btns-left">
                        <br/><br/><br/><p className="breaker"/>
                        {init && left}
                    </div>

                    <div className="btns-right">
                        <br/><br/><br/><p className="breaker"/>
                        {init && right}
                    </div>
                </div>
        </div>
    )
}