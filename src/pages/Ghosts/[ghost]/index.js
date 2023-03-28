import { useRouter } from "next/router.js";
import Info from "../../../components/Info.js";
import { ghosts } from "../../../utils/consts.js";


export default function Ghosts() { 
    const router = useRouter();
    const ghost = router.query.ghost;

    return (
        <Info title={"ghosts"} selected={ghost} array={ghosts}></Info>
    )
}

