import { useRouter } from "next/router.js";
import Info from "../../../components/Info.js";
import { equipment } from "../../../utils/consts.js";

export default function Equipment() { 
    const router = useRouter();
    const item = router.query.item;

    return <Info title="equipment" selected={item} array={equipment}></Info>
 }