import Link from 'next/link';
import axios from 'axios';
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';


const Input = () => {
    const socket = io();
    
    const [statusArray, setStatusArray] = useState([]);
    const [checkboxes, setCheckbox] = useState();
    // fetch('http://localhost:3000/api/persons')
    useEffect(() => {
        console.log("i fire once");

        axios.get('/api/getstatus').then(res => {
            console.log(res.data)
            return render_people(res.data)
        });

        socket.on('status update', () => {
            console.log("STATUS UPDATE")
            axios.get('/api/getstatus').then(res => {
                console.log(res.data)
                return render_people(res.data)
            });
        });
    }, []);

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
            <div id="main">
                <h1>Ange din status</h1>
                    {(statusArray === undefined) ? 
                        <h1>Laddar innehållet..</h1> : statusArray }
            </div>
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