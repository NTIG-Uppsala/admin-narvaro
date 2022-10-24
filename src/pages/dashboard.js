import Link from 'next/link';
import axios from 'axios';
import React, { useState, useEffect } from "react";

const GroupOptions = (props) => {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        axios.get('/api/getgroups').then((response) => {
            /* For all groups create an option for it */
            let response_data = response.data.map((item, index) => {
                /* If the group id is the same as user group, select it */
                let new_element = <option key={index} value={item._id} selected={props.group_id == item._id}>{item.display_name}</option>
                return new_element
            });
            setGroups(response_data);
        });
    }, []);



    return (
        <select className="dropdown-menu" id={props.id} name={props.name}  onChange={props.onChange}>
            {(groups.length == 0) ? <option>Laddar innehållet...</option> : groups}
        </select>
    )
}

const PrivilegeOptions = (props) => {
    /* Works the same way as group options */
    const [privileges, setPrivileges] = useState([]);

    useEffect(() => {
        console.log("use Effect ran")
        axios.get('/api/getprivileges').then((response) => {
            let response_data = response.data.map((item, index) => {
                let new_element = <option key={index}  value={item._id} selected={props.privilege_id == item._id}>{item.display_name}</option>
                return new_element
            });
            setPrivileges(response_data);
        });
    }, []);

    return (
        <select className="dropdown-menu" onChange={props.onChange} id={props.id} name={props.name}>
            {(privileges.length == 0) ? <option>Laddar innehållet...</option> : privileges}
        </select>
    )

}

const Person = (props) => {
    return (
        <div className={"message-container message-container-flexwrap" + ((props.id % 2 == 0) ? ' gray-color' : '')} onChange={props.onChange}>
            <div className="name name-flexwrap">
                <input type="text" required name="name" id={props._id} defaultValue={props.name}></input>
            </div>
            <div className="name name-flexwrap">
                <input type="text" required name="role" id={props._id} defaultValue={props.role}></input>
            </div>
            <div className="container container-flexwrap">
                <PrivilegeOptions name="privilege" id={props._id}  privilege_id={props.privilege_id} />
            </div>
            <div className="container container-flexwrap">
                <GroupOptions  name="group" id={props._id} group_id={props.group_id}/>
            </div>
        </div>
    )

}


const Dashboard = () => {
    const [people, setPeople] = useState([]);
    const [formValues, setFormValues] = useState([]);
    const [submitOk, setSubmitOk] = useState(false);

    /* Called whenever a user input is changed */
    const handleInputChange = (event, person) => {
        setSubmitOk(false) /* Reset submitOk */
        let new_form_val = {
            objectId: person._id,
            name: person.name,
            role: person.role,
            privilege: person.privilege,
            group: person.group
        };
        /* 
            If no person has been changed yet.
            Add the new person to the array with the changed values
        */
        setFormValues((oldFormValues) => {
            console.log("ALL old values -> ", oldFormValues)

            /* Searches for person in values */
            let user_found = 
                oldFormValues.find((item) => item.objectId == event.target.id) !== undefined;

            console.log("Was user found in changes? -> ", user_found)

            /* If person hasn't been changed before, add the user to the list */
            if (!user_found) {
                new_form_val[event.target.name] = event.target.value
                console.log("New user change value -> ", new_form_val)
                return [...oldFormValues, new_form_val]
            } 

            /* If person has already been changed, change its values */
            let new_changed_value = oldFormValues.map(item => {
                if (item.objectId !== event.target.id) {
                    return item;
                }
                else {
                    return {
                        ...item,
                        [event.target.name]: event.target.value,
                    };
                }
                    
            });

            return [...new_changed_value]
        });
    };

    
    /* When the page is rendered, get all users and create a people component */
    useEffect(() => {   
        // GARL: https: //bobbyhadz.com/blog/react-push-to-state-array
        /* Renders all users to the page after getting users from api */
        axios.get("/api/getusers").then((response) => {
            const peopleFromApi = response.data.map((item, index) => (
                <Person
                    key={index}
                    _id={item._id}
                    name={item.name}
                    role={item.role}
                    privilege_id={item.privilege}
                    group_id={item.group}
                    onChange={(event) => handleInputChange(event, item)}
                />
            ));
        
            setPeople(peopleFromApi);
        }); 

    }, []);

    useEffect(() => {   
        console.log("CURRENT formvalues", formValues)
    }, [formValues]);

    /* Called when the client presses the save button  */
    const submit = (values) => {
        console.log(values)
        axios.post('/api/updateusers', values).then((response) => {
            console.log(response)
            if (response.status == 200) {
                setFormValues([])
                setSubmitOk(true)
            }
        });
    
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
                    <h1>Administration</h1>
                    {(people.length == 0) ? 
                        <h1>Laddar innehållet..</h1> : people }
                </div>

                
                <div className='center-button'>
                    {
                        (formValues.length != 0) ?
                            <>
                                <Link href="/dashboard" >
                                    <a onClick={() => submit(formValues)} className="save-button">Spara</a>
                                </Link>
                                <Link href={'/dashboard'} >
                                    <a onClick={() => {setFormValues([])}} className="save-button red-button">Avbryt</a>
                                </Link>
                            </>
                        : null
                            
                    }
                    {
                        (submitOk) ? <p>Ändring lyckades!</p> : null
                    }
                    
                    
                </div>

            </div> 
        </div>
        
      </>
         
    );
  }
  
  export default Dashboard;