import React, { useState, useEffect } from "react";
import io from 'socket.io-client';

const Checkbox = (props) => {
    const [checked, setChecked] = useState(props.status);
    const socket = io();

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

export default Checkbox;