import GroupOptions from "./DashboardGroupOptions"
import PrivilegeOptions from "./DashboardPrivilegeOptions"
import React, { useState, useEffect } from 'react'
const Person = (props) => {
    const [person, setPerson] = useState(props)
    const [changing, setChanging] = useState(false)

    return (
        <div className={"message-container message-container-flexwrap" + ((props.id % 2 == 0) ? ' gray-color' : '')} onChange={props.onChange}>
            <div className="name name-size">
                {
                    changing ?
                        <input type="text" name="name" value={person.name} onChange={(e) => setPerson({ ...person, name: e.target.value })} />
                        :
                        <p>{person.name}</p>
                }
            </div>
            <div className="name name-size">
                {
                    changing ?
                        <input type="text" name="role" value={person.role} onChange={(e) => setPerson({ ...person, role: e.target.value })} />
                        :
                        <p>{person.role}</p>
                }
            </div>
            <div className="container container-flexcenter">
                {
                    changing ?
                        <PrivilegeOptions name="privilege" id={props._id} privilege_id={props.privilege_id} />
                        :
                        <p>{person.privilege_id}</p>
                }

            </div>
            <div className="container container-flexcenter">
                {
                    changing ?
                        <GroupOptions name="group" id={props._id} group_id={props.group_id} />
                        :
                        <p>{person.group_id}</p>
                }
            </div>
            <button onClick={() => { setChanging(!changing) }}>edit</button>
        </div>
    )
}

export default Person;