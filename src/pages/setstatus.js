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

        let people_elements = [];
        if (person_object == null) return;

        person_object.forEach((item, index) => {
            // console.log("forloop")
            
            console.log(item)
            people_elements.push(
            <Person
                key={index}
                _id={item._id}
                id={index+1}
                name={item.name}
                status={item.status}
            />)
        
        });

        setStatusArray(people_elements)
        console.log("Status array::::", statusArray)

    }
    const Checkbox = (props) => {
        const [checked, setChecked] = useState(props.status);
        // https://bobbyhadz.com/blog/react-check-if-checkbox-is-checked

        const handleCheckboxChange = (event) => {
            let return_value = {
                id: event.target.name,
                status: event.target.checked
            }
            
            setChecked(event.target.checked)

            socket.emit("status change", return_value)
            
        }

        return (
            <label className="switch" htmlFor={'avaliable-' + props.name.replace(" ", "-")}>
                <input 
                    type="checkbox" 
                    name={props._id} 
                    id={'avaliable-' + props.name.replace(" ", "-")} 
                    onChange={handleCheckboxChange} 
                    checked={checked}
                />
                <div className="slider round"></div>
            </label>
        )
    }

    const Person = (props) => {
        return (
            <div className={"message-container" + ((props.id % 2 == 0) ? ' gray-color' : '')}>
                <div className="name">
                    <span>{props.name}</span>
                </div>
                <div className="container">
                    <Checkbox _id={props._id} name={props.name} status={props.status}/>
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
                    <h1>Ange din status</h1>
                    {(statusArray === undefined) ? 
                        <h1>Laddar innehållet..</h1> : statusArray }
                </div>
                : <p>Tillträde förbjuden</p>
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