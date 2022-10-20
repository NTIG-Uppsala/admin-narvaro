import Link from 'next/link';
import axios from 'axios';
import React, { useState, useEffect } from "react";

const GroupOptions = (props) => {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        axios.get('/api/getgroups').then((response) => {
            response.data.forEach((item, index) => {
                let new_element = <option key={index} value={item._id} selected={props.group_id == item._id}>{item.display_name}</option>
                setGroups(oldGroups => [...oldGroups, new_element])
            });
        });
    }, []);



    return (
        <select className="dropdown-menu" id={props.id} name={props.name}  onChange={props.onChange}>
            {(groups.length == 0) ? <option>Laddar innehållet...</option> : groups}
        </select>
    )
}

const PrivilegeOptions = (props) => {
    const [privileges, setPrivileges] = useState([]);

    useEffect(() => {
        console.log("use Effect ran")
        axios.get('/api/getprivileges').then((response) => {
            response.data.forEach((item, index) => {
                console.log(props.privilege_id == item._id, props.privilege_id, item._id)
                let new_element = <option key={index}  value={item._id} selected={props.privilege_id == item._id}>{item.display_name}</option>
                setPrivileges(oldPrivileges => [...oldPrivileges, new_element])
            });
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
        <div className={"message-container" + ((props.id % 2 == 0) ? ' gray-color' : '')} onChange={props.onChange}>
            <div className="name">
                <input type="text" required name="name" id={props._id} defaultValue={props.name}></input>
            </div>
            <div className="name">
                <input type="text" required name="role" id={props._id} defaultValue={props.role}></input>
            </div>
            <div className="container">
                <PrivilegeOptions name="privilege" id={props._id}  privilege_id={props.privilege_id} />
            </div>
            <div className="container">
                <GroupOptions  name="group" id={props._id} group_id={props.group_id}/>
            </div>
        </div>
    )

}


const Dashboard = () => {
    const [people, setPeople] = useState([]);

    const [formValues, setFormValues] = useState([]);

    const handleInputChange = (event, person) => {
        
        let new_form_val = {
            objectId: person._id,
            name: person.name,
            role: person.role,
            privilege: person.privilege,
            group: person.group
        };

        console.log("handleChange")

        console.log(event.target)

        console.log(formValues)
        


        if (formValues.length == 0)
        {
            console.log("formValues is empty")
            setFormValues(() => {
                new_form_val[event.target.name] = event.target.value
                formValues.push(new_form_val)
                return formValues
            })
            return
        }
            

        // console.log(event.target.value)
        
        setFormValues((oldFormValues) => {

            let form_val = formValues.find((item) => item.objectId == event.target.id)

            if (form_val) {
                console.log("person in formValues", form_val)

                let index = formValues.indexOf(form_val)
                formValues[index][event.target.name] = event.target.value
                return formValues
            } 
            else {
                new_form_val[event.target.name] = event.target.value
                console.log("new form valu", new_form_val)
                
                return [...oldFormValues, new_form_val]
            }
        });



    }

    useEffect(() => {   
        // GARL: https: //bobbyhadz.com/blog/react-push-to-state-array
            setPeople([])
            setFormValues([])
            
            axios.get('/api/getusers').then((response) => {
                response.data.forEach((item, index) => {
                    setPeople(oldStatusArray => {
                        return [...oldStatusArray, <Person
                            key={index}
                            id={index+1}
                            _id={item._id}
                            name={item.name}
                            role={item.role}
                            privilege_id={item.privilege}
                            group_id={item.group}
                            onChange={(event) => handleInputChange(event, item)}
                        />]
                    })
                
                }); 
            })

    }, []);

    useEffect(() => {   
        console.log("CURRENT formvalues", formValues)
    }, [formValues, setFormValues]);

    const submit = (values) => {
        console.log(values)
        axios.post('/api/updateusers', values).then((response) => {
            console.log(response)
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
                    <h1>Ange din status</h1>
                    {(people.length == 0) ? 
                        <h1>Laddar innehållet..</h1> : people }
                </div>

                
                <div className='center-button'>
                    {
                        (formValues.length > 0) ?
                            <Link href="/verysecretadminpanelabc123" >
                                <a onClick={() => submit(formValues)} className="save-button">Spara</a>
                            </Link>
                        : null
                    }
                    
                    <Link href={'/verysecretadminpanelabc123'}>
                        <a className="save-button red-button">Avbryt</a>
                    </Link>
                </div>

            </div> 
        </div>
        
      </>
         
    );
  }
  
  export default Dashboard;