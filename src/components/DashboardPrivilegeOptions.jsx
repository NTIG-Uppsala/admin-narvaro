import axios from 'axios';
import React, { useState, useEffect } from "react";
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

export default PrivilegeOptions;