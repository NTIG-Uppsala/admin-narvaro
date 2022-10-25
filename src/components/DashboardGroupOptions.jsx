
import React, { useState, useEffect } from "react";
import axios from 'axios';
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

export default GroupOptions;