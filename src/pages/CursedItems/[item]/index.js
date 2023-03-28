import Nav from "@/components/Nav.js";
import { useRouter } from "next/router.js";
import Info from "../../../components/Info.js";
import { cursedItems } from "../../../utils/consts.js";

export default function CursedItems() { 
    const router = useRouter();
    const item = router.query.item;

    return (
        <Info title="cursedItems" selected={item} array={cursedItems}></Info>
    )
 }