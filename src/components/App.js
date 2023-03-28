import Nav from './Nav';
import React, {useEffect, useState} from 'react';
import { initInfo } from '../utils/consts';
import Map from '@/pages/Maps/[map]';

export default function App() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if(!loaded) {
            initInfo();

            setLoaded(true);
        }
    })
    
    if(!loaded) return <p>Loading...</p>;

    return (
        <Map/>
    );
}
