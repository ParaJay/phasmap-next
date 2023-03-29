import React, {useEffect, useState} from 'react';
import { initInfo } from '../utils/consts';
import Map from '@/pages/Maps/[map]';

export default function App() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        async function init() {
            await initInfo();
            setLoaded(true);
        }

        if(!loaded) {
            init();
        }
    })
    
    if(!loaded) return <p>Loading...</p>;

    return (
        <Map/>
    );
}
