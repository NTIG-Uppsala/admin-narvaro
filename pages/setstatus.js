import Link from 'next/link';
import axios from 'axios';
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
import { useRouter } from 'next/router'

const Input = () => {
    const socket = io();
    
    const [statusArray, setStatusArray] = useState([]);
    const [verified, setVerified] = useState(false);

    const router = useRouter()


    // fetch('http://localhost:3000/api/persons')
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

    const handleCheckboxChange = (event) => {
        let return_value = {
            name: event.target.name,
            status: event.target.checked
        }

        // setCheckbox(prevState => {
        //     let checkbox = Object.assign({}, prevState.name);  // creating copy of state variable jasper
        //     checkbox.name = event.target.name;             
        //     checkbox.chacked = event.target.checked        // update the name property, assign a new value                 
        //     return { checkbox };                                 // return new object jasper object
        // })

        // console.log("checkbox", checkboxes)

        socket.emit("status change", return_value)
        
    }

    const render_people = (person_object) => {

        let people_elements = [];
        if (person_object == null) return;

        person_object.forEach((item, index) => {
            // console.log("forloop")
            
            console.log(item)
            people_elements.push(
            <Person
                key={index}
                id={index+1}
                name={item.name}
                status={item.status}
            />)
        
        });

        setStatusArray(people_elements)
        console.log("Status array::::", statusArray)

    }

    const Person = (props) => {
        return (
            <div className={"message-container" + ((props.id % 2 == 0) ? ' gray-color' : '')}>
                <div className="name">
                    <span>{props.name}</span>
                </div>
                <div className="container">
                    <label className="switch" htmlFor={'avaliable-' + props.name.replace(" ", "-")}>
                            <input 
                                type="checkbox" 
                                name={props.name} 
                                id={'avaliable-' + props.name.replace(" ", "-")} 
                                onChange={handleCheckboxChange} 
                                checked={props.status}
                            />

                        <div className="slider round"></div>
                    </label>
                </div>
            </div>
        )

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
                    <div className="title-grid">
                        <h1>Ange din status</h1>
                        <Link href={'/dashboard?auth=' + router.query.auth}>
                            <img src="images/edit.svg"></img>  
                        </Link>
                        
                    </div>
                    {(statusArray === undefined) ? 
                        <h1>Laddar innehållet..</h1> : statusArray }
                </div>
            : <h1>Unverified</h1>
            }
            
            <div>
                <Link href="/">
                    <a>Visa Status</a>
                </Link>
            </div>
            </div> 
        </div>
        
      </>
         
    );
  }
  
  export default Input;