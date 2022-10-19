import Link from 'next/link';
import axios from 'axios';
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';

const Input = () => {
    const [statusArray, setStatusArray] = useState([]);
    const [privileges, setPrivileges] = useState([]);
    const [groups, setGroups] = useState([]);

    // fetch('http://localhost:3000/api/persons')
    useEffect( () => {
        // GARL: https://bobbyhadz.com/blog/react-push-to-state-array
        console.log("i fire once");
        // console.log("router.query: ", router.query.auth);

        axios.get('/api/getusers').then((res) => {
            render_people(res.data)
        })

        // setGroupDropdown(GroupOptions)
        // setPrivilegeDropdown(<PrivilegeOptions/>)

        axios.get('/api/getgroups').then((response) =>  {
            console.log(response.data)
            response.data.forEach((item, index) => {
                // console.log("forloop")
                console.log(item)
                let new_element = <option key={index} value="hellouwu">hello2</option>
                setGroups(oldGroups => [...oldGroups, new_element])
    
            });
        });


    }, []);

    const handleCheckboxChange = (event) => {
        let return_value = {
            name: event.target.name,
            status: event.target.checked
        }

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
                role={item.role}
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
                    <input type="text" required defaultValue={props.name}></input>
                </div>
                <div className="name">
                    <input type="text" required defaultValue={props.role}></input>
                </div>
                <div className="container">
                    <select className="dropdown-menu" id={props.id}>
                        {(privileges.length == 0) ? <option>Laddar innehållet...</option> : privileges}
                    </select>
                </div>
                <div className="container">
                    <select className="dropdown-menu" id={props.id}>
                        {(groups.length == 0) ? <option>Laddar innehållet...</option> : groups}
                    </select>
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

                
                <div className='center-button'>
                    <Link href="/">
                        <a className="save-button" onClick={console.log("clicked")}>Spara</a>
                    </Link>
                    <Link href={'/dashboard'}>
                        <a className="save-button red-button">Avbryt</a>
                    </Link>
                </div>

            </div> 
        </div>
        
      </>
         
    );
  }
  
  export default Input;