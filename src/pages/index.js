import axios from 'axios';
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';


const Output = () => {
    const socket = io();

    const [statusArray, setStatusArray] = useState([]);

    // fetch('http://localhost:3000/api/persons')
    useEffect(() => {
        console.log("i fire once");

        axios.get('/api/getstatus').then(res => {
            console.log(res.data)

            return render_people(res.data)

        });

        socket.on('status update', (response) => {
            console.log(response)
            console.log("STATUS UPDATE")
            return render_people(response)
        });

    }, []);

    const render_people = (person_object) => {
        let people_elements = [];

        person_object.forEach((item, index) => {
            // console.log("forloop")
            
            let new_element = <Person
                key={index}
                name={item.name}
                role={item.role}
                avalibility={(item.status == true) ? "Tillgänglig" : "Ej tillgänglig"}
                latest_change_from_now={item.latest_change_from_now}
            />

            people_elements.push(new_element)

            console.log(item.name)

        
        });

        setStatusArray(people_elements)

    }

    const Person = (props) => {
        return (
            <div className="message-container" id="message-containerOutput">
                <div className="name">
                    <span> {props.name} </span>
                    <span className="role"> {props.role}  </span>
                </div>
                <div className="status">
                    <span> {props.avalibility} </span>
                    <span className="latest-update">Senast uppdaterad: {props.latest_change_from_now} </span>
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
                <div className="message-container-wrapper">
                    <h1>Status</h1>
                    <div id="statusDiv">
                    {(statusArray.length < 1) ? <h1>loading</h1> : statusArray }
                    </div>
                </div>
        </>

    )
    
}

export default Output;