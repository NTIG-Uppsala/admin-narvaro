import axios from 'axios';
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';

import Person from '../components/PersonStatus'

const Output = () => {
    const [statusArray, setStatusArray] = useState();

    const socket = io();

    /* Will be runned as a client side script when the page renders */
    useEffect(() => {
        axios.get('/api/getusers').then(res => {
            console.log("data gotten from api: \n", res.data)

            return render_people(res.data)
        });

        socket.on('status update', (response) => {
            console.log("STATUS UPDATE: \n", response)
            axios.get('/api/getusers').then(res => {
                console.log("data gotten from api: \n", res.data)
                return render_people(res.data)
            });
        });
    }, []);

    /* Used to update content on page */
    function render_people(person_object) {
        let people_elements = [];
        console.log(person_object)
        person_object.forEach((item, index) => {
            let new_element = <Person
                key={index}
                id={index+1}
                name={item.name}
                role={item.role}
                status={item.status}
                avalibility={(item.status == true) ? "Tillgänglig" : "Ej tillgänglig"}
                latest_change={item.latest_change}
            />
            people_elements.push(new_element)
        });
        setStatusArray(people_elements)
    }

    return (
        <>
            <div className="backgroundImage">
                <img src="/images/backgroundNTI.jpg"/>
            </div>
        
            <img id="logo" src="images/nti_logo_footer.svg" alt=""/>
            <div className="grid-center">
                <div className="message-container-wrapper">
                    <h1>Status</h1>
                    <div id="statusDiv">
                        {(statusArray === undefined) ? 
                        <h1>Laddar innehållet..</h1> : statusArray }
                    </div>
                </div>
            </div>
        </>
    )
}

export default Output;