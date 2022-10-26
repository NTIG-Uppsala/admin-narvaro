import axios from 'axios';
import React, { useState, useEffect } from 'react'
const Person = (props) => {
    const [person, setPerson] = useState(props)
    const [changing, setChanging] = useState(false)
    const [submitOk, setSubmitOk] = useState(false);

    /* Called when the client presses the save button  */
    const submit = () => {
        axios.post('/api/updateusers', { user: person }).then((response) => {
            if (response.status == 200) {
                console.log("success")
                setChanging(false)
                setSubmitOk(true)
            }
        });
    }

    useEffect(() => { console.log(person) }, [person])

    return (
        <div className={"message-container message-container-flexwrap" + ((props.id % 2 == 0) ? ' gray-color' : '')} onChange={props.onChange}>
            <div className="name name-size">
                {
                    changing ?
                        <input type="text" value={person.name} onChange={(e) => setPerson({ ...person, name: e.target.value })} />
                        :
                        <p>{person.name}</p>
                }
            </div>
            <div className="name name-size">
                {
                    changing ?
                        <input type="text" value={person.role} onChange={(e) => setPerson({ ...person, role: e.target.value })} />
                        :
                        <p>{person.role}</p>
                }
            </div>
            <div className="container container-flexcenter">
                {
                    changing ?
                        <select className="dropdown-menu" defaultValue={person.privilege} onChange={() => { setPerson({ ...person, privilege: e.target.value }) }} id={props.id}>
                            {
                                props.privileges.map((privilege, index) => {
                                    return <option key={privilege._id} value={privilege._id} >{privilege.display_name}</option>
                                })
                            }
                        </select>
                        :
                        <p>{person.privilege_name}</p>
                }

            </div>
            <div className="container container-flexcenter">
                {
                    changing ?
                        <select className="dropdown-menu" id={props.id} defaultValue={person.group} onChange={() => { setPerson({ ...person, group: e.target.value }) }}>
                            {
                                props.groups.map((group, index) => {
                                    return <option key={group._id} value={group._id}>{group.display_name}</option>
                                })
                            }
                        </select>
                        :
                        <p>{person.group_name}</p>
                }
            </div>
            <button onClick={() => { setChanging(!changing) }}>edit</button>
            <button onClick={() => { submit() }}>Save</button>
            <p>{(submitOk) ? "Uppdaterad" : ""}</p>
        </div>
    )
}

export default Person;