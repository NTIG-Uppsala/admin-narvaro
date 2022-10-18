import axios from 'axios';
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
import moment from 'moment';

moment.locale('sv')


const Output = () => {
    const socket = io();

    const [statusArray, setStatusArray] = useState();

    /* Will be runned as a client side script */
    useEffect(() => {
        axios.get('/api/getstatus').then(res => {
            console.log("data gotten from api: \n", res.data)

            return render_people(res.data)

        });

        socket.on('status update', (response) => {
            console.log("STATUS UPDATE: \n", response)
            return render_people(response)
        });

    }, []);

    /* Used to update content on page */
    function render_people (person_object) {
        let people_elements = [];
        person_object.forEach((item, index) => {
            // console.log("forloop")
            
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

    const Person = (props) => {
        return (
            <div className={"message-container" + ((props.id % 2 == 0) ? ' gray-color' : '')} id="message-containerOutput">
                <div className="name status-flex">
                    <span>{props.name}</span>
                    <span className="role subheading">{props.role} </span>
                </div>
                <div className="status-flex">
                    <span className={(props.status == true) ? 'green-color' : 'red-color'}> {props.avalibility} </span>
                    <span className="latest-update subheading">Senast uppdaterad: {moment(props.latest_change).fromNow()} </span>
                </div>    
            </div>
        )
    }

    return (
        <>
            <div className="backgroundImage">
                <img src="/images/backgroundNTI.jpg"/>
            </div>
        
            <img id="logo" src="images/nti_logo_footer.svg" alt=""/>
            <div class="grid-center">
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