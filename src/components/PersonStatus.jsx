import React, { useState, useEffect } from "react";
import moment from 'moment';
import 'moment/locale/sv';
const Person = (props) => {
    const [latest, setLatest] = useState(props.latest_change)
    const [latest_change, setLatestChange] = useState(() => {return moment(props.latest_change).fromNow()});
   
    moment.locale('sv')

    const update_latest_change = () => {
        return setLatestChange(moment(latest).fromNow())
    }

    useEffect(() => {
        console.log("useEffect in person")
        /* Will update the from now every minute */
        setLatestChange(() => {return moment(props.latest_change).fromNow()})
        
        setInterval(update_latest_change, 60000);

    }, [props.latest_change])

    return (
        <div className={"message-container" + ((props.id % 2 == 0) ? ' gray-color' : '')} id="message-containerOutput">
            <div className="name status-flex">
                <span>{props.name}</span>
                <h4 className="role">{props.role} </h4>
            </div>
            <div className="status status-flex">
                <span className={(props.status == true) ? 'green-color' : 'red-color'}> {props.avalibility} </span>
                <h4 className="latest-update">Senast uppdaterad: {moment(props.latest_change).fromNow()} </h4>
            </div>    
        </div>
    )
}

export default Person;