import { useState } from "react";
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
        <>
            <label htmlFor={props._id} className="inline-flex relative items-center cursor-pointer">
                <input
                    type="checkbox"
                    name={props._id}
                    id={props._id}
                    onChange={handleCheckboxChange}
                    checked={checked}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-red-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500 duration-500"></div>
                {/*             <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Default toggle</span> */}
            </label>
        </>
    )
}

export default Checkbox;