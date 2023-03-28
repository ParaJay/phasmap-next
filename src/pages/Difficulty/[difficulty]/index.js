import { useRouter } from "next/router.js";
import Info from "../../../components/Info.js";
import { difficulties } from "../../../utils/consts.js";

export default function Difficulty() { 
    const router = useRouter();
    const difficulty = router.query.difficulty;

    return <Info title="difficulty" selected={difficulty} array={difficulties}></Info>
 }
