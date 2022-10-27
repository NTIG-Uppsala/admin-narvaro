import Link from 'next/link';
import axios from 'axios';
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
import { useRouter } from 'next/router'

import Person from '../components/SetPersonStatus';

const Input = () => {
    const socket = io();
    
    const [people, setPeople] = useState([]);
    const [verified, setVerified] = useState(false);

    const router = useRouter()

    /* 
        When the Page is loaded
        - Verify the url
        - add a socket listener for status update
    */

    useEffect( () => {
        if (router.isReady) {

            console.log("i fire once");
            console.log("router.query: ", router.query.auth);

            axios.post('/api/verifyurl', {uri: router.query.auth}).then(res => {
                console.log(res.data)
                setVerified(res.data.verified)
                render_people(res.data.users)
            });

            socket.on('status update', () => {
                console.log("STATUS UPDATE")
                axios.post('/api/verifyurl', {uri: router.query.auth}).then(res => {
                    console.log(res.data)
                    setVerified(res.data.verified)
                    render_people(res.data.users)
                });
            });
        }
    }, [router.isReady]);

    /* Render the person */
    const render_people = (person_object) => {

        if (person_object == null) return;
        let people_elements = person_object.map((item, index) => {
            return ( 
                <Person
                    key={index}
                    _id={item._id}
                    id={index+1}
                    name={item.name}
                    status={item.status}
                />
            )
        })
        setPeople(people_elements)
        console.log("Status array::::", people)
    }

    return (
      <>
        <div className="backgroundImage">
          <img src="images/backgroundNTI.jpg" />
        </div>
  
        <img id="logo" src="images/nti_logo_footer.svg" alt="" />
        
        <div className="grid-center">
            <div className="message-container-wrapper">

            {(verified) ? 
                <div id="main">
                    <h1>Ange din status</h1>
                    {(!people.length) ? 
                        <h1>Laddar innehållet..</h1> 
                        : 
                        people 
                    }
                </div>
                : <p>Tillträde förbjuden</p>
                }
            
                <div>
                    <Link href="/">
                        <a id="status-link-hover">Visa Status</a>
                    </Link>
                </div>
            </div> 
        </div>
      </>     
    );
  }
  
  export default Input;