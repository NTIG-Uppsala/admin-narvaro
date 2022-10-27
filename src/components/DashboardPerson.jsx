import axios from 'axios';
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
const Person = (props) => {
    const [person, setPerson] = useState(props)
    const [changing, setChanging] = useState(props.changing || false)
    const [submitOk, setSubmitOk] = useState(false);
    const Router = useRouter()
    /* Called when the client presses the save button  */
    const submit = () => {
        axios.post('/api/updateusers', { user: person }).then((response) => {
            if (response.status == 200) {
                console.log("success")
                setChanging(false)
                setSubmitOk(true)
                Router.reload()
            }
        });
    }

    const deleteUser = () => {
        return axios.post('/api/deleteuser', { user: person }).then((response) => {
            if (response.status == 200) {
                console.log("success")
                setChanging(false)
                setSubmitOk(true)
            }
            Router.reload()
        });
    }

    useEffect(() => { console.log(person) }, [person])

    const new_uri = () => {
        let uri = (len) => {
            let result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < len; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
        setPerson({ ...person, uri: uri(10) })
    }

    return (
        <>
            {
                (!changing) ?
                    <div>
                        <h1 className="person-info">{person.name}</h1>
                        <h2 className="person-info">{person.role}</h2>
                        <div className="menu-title menu-text">
                            Behörighet
                        </div>
                        <div className="rights">
                            {person.privilege_name}
                        </div>
                        <div className="menu-title menu-text">
                            Grupp
                        </div>
                        <div className="rights">
                            {person.group_name}
                        </div>
                        <div className="link-border link-position">
                            <Link href={"https://narvaro.ntig.net/setstatus?auth=" + person.uri}>
                                <a target='_blank' >
                                    {"https://narvaro.ntig.net/setstatus?auth=" + person.uri}
                                </a>
                            </Link>
                        </div>
                        {
                            (person._id !== -1) ? <button className="rights" onClick={() => { setChanging(!changing) }}>Redigera <img src="/images/pen.svg" alt="penna knapp" /></button> : null
                        }
                    </div>
                    :
                    <div>
                        <input type="text" value={person.name} onChange={(e) => setPerson({ ...person, name: e.target.value })} />
                        <input type="text" value={person.role} onChange={(e) => setPerson({ ...person, role: e.target.value })} />

                        <div className="title menu-text">
                            Behörighet
                        </div>
                        <select className="dropdown-menu" defaultValue={person.privilege} onChange={(e) => { setPerson({ ...person, privilege: e.target.value }) }} id={props.id}>
                            {
                                props.privileges.map((privilege, index) => {
                                    return <option key={privilege._id} value={privilege._id} >{privilege.display_name}</option>
                                })
                            }
                        </select>
                        <div className="title menu-text">
                            Grupp
                        </div>
                        <select className="dropdown-menu" id={props.id} defaultValue={person.group} onChange={(e) => { setPerson({ ...person, group: e.target.value }) }}>
                            {
                                props.groups.map((group, index) => {
                                    return <option key={group._id} value={group._id}>{group.display_name}</option>
                                })
                            }
                        </select>
                        <div className="menu menu-left title link-border">
                            {(person.uri) ?
                                <Link href={"https://narvaro.ntig.net/setstatus?auth=" + person.uri}>
                                    <a target='_blank' >
                                        {"https://narvaro.ntig.net/setstatus?auth=" + person.uri}
                                    </a>
                                </Link>
                                :
                                new_uri()
                            }
                            <button className="refresh-button" onClick={() => { new_uri() }}>
                                <img src="images/refresh.svg" alt="hämta om knapp"></img>
                            </button>
                        </div>
                        <div className="menu title">
                            {
                                (person._id !== undefined) ? <button className="back-button" onClick={() => { setChanging(!changing) }}><img src="images/back.svg" alt="tillbaka knapp"></img></button> : null
                            }
                            <button className="save-button" onClick={() => { submit() }}>
                                Spara
                            </button>
                            <button className="delete-button" onClick={() => { deleteUser() }}>
                                <img src="images/trash.svg" alt="ta bort knapp"></img>
                            </button>
                        </div>
                    </div>
            }
        </>


    )
}

export default Person;