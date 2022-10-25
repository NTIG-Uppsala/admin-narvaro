import axios from 'axios';
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
import moment from 'moment';
import 'moment/locale/sv';


const Output = () => {
    const socket = io();
    moment.locale('sv')

    const [statusArray, setStatusArray] = useState();


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
        const [latest, setLatest] = useState(props.latest_change)
        const [latest_change, setLatestChange] = useState(() => {return moment(props.latest_change).fromNow()});

        const update_latest_change = () => {
            return setLatestChange(moment(latest).fromNow())
        }

        useEffect(() => {
            console.log("useEffect in person")
            /* Will update the from now every minute */
            setLatestChange(() => {return moment(props.latest_change).fromNow()})
            
            setInterval(update_latest_change, 60000);

        }, [props.latest_change])

        return (
            <div className={"message-container" + ((props.id % 2 == 0) ? ' gray-color' : '')} id="message-containerOutput">
                <div className="name status-flex">
                    <span>{props.name}</span>
                    <h4 className="role">{props.role} </h4>
                </div>
                <div className="status status-flex">
                    <span className={(props.status == true) ? 'green-color' : 'red-color'}> {props.avalibility} </span>
                    <h4 className="latest-update">Senast uppdaterad: {moment(props.latest_change).fromNow()} </h4>
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