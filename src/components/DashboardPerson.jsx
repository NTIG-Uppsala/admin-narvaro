import axios from 'axios';
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

const Person = (props) => {
    const [person, setPerson] = useState(props)
    const [changing, setChanging] = useState(props.changing || false)
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

    const deleteUser = () => {
        axios.post('/api/deleteuser', { user: person }).then((response) => {
            if (response.status == 200) {
                console.log("success")
                setChanging(false)
                setSubmitOk(true)
                setPerson({ name: "Deleted", email: "Deleted", role: "Deleted" })
            }
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
                        <h1 className="bruh2">{person.name}</h1>
                        <h2 className="bruh2">{person.role}</h2>
                        <div className="menu-title menu-title2">
                            Behörighet
                        </div>
                        <div className="saker">
                            {person.privilege_name}
                        </div>
                        <div className="menu-title menu-title2">
                            Grupp
                        </div>
                        <div className="saker">
                            {person.group_name}
                        </div>
                        <div className="link link2">
                            {(person.uri) ?
                                <Link href={"https://narvaro.ntig.net/setstatus?auth=" + person.uri}>
                                    <a target='_blank' >
                                        {"https://narvaro.ntig.net/setstatus?auth=" + person.uri}
                                    </a>
                                </Link>
                                :
                                <p>no link</p>
                            }
                        </div>
                        <button className="saker" onClick={() => { setChanging(!changing) }}>
                            Redigera
                        </button>
                    </div>
                    :
                    <div>
                        <input type="text" value={person.name} id="bruh3" onChange={(e) => setPerson({ ...person, name: e.target.value })} />

                        {/* <input type="text" placeholder="Henrik Jonsson" id="bruh3"></input> */}
                        {/* <input type="text" placeholder="Titel" id="bruh"></input> */}
                        <input type="text" value={person.role} onChange={(e) => setPerson({ ...person, role: e.target.value })} />

                        <div className="title menu-title">
                            Behörighet
                        </div>
                        <select className="dropdown-menu" defaultValue={person.privilege} onChange={(e) => { setPerson({ ...person, privilege: e.target.value }) }} id={props.id}>
                            {
                                props.privileges.map((privilege, index) => {
                                    return <option key={privilege._id} value={privilege._id} >{privilege.display_name}</option>
                                })
                            }
                        </select>
                        <div className="title menu-title">
                            Grupp
                        </div>
                        <select className="dropdown-menu" id={props.id} defaultValue={person.group} onChange={(e) => { setPerson({ ...person, group: e.target.value }) }}>
                            {
                                props.groups.map((group, index) => {
                                    return <option key={group._id} value={group._id}>{group.display_name}</option>
                                })
                            }
                        </select>
                        <div className="menu menu-left title link">
                            {(person.uri) ?
                                <Link href={"https://narvaro.ntig.net/setstatus?auth=" + person.uri}>
                                    <a target='_blank' >
                                        {"https://narvaro.ntig.net/setstatus?auth=" + person.uri}
                                    </a>
                                </Link>
                                :
                                <p>no link</p>
                            }
                            <button className="refresh-button" onClick={() => { new_uri() }}></button>
                        </div>
                        <div className="menu title">
                            <button className="back-button" onClick={() => { setChanging(!changing) }}>
                                Tillbaka
                            </button>
                            <button className="save-button" onClick={() => { submit() }}>
                                Spara
                            </button>
                            <button className="delete-button" onClick={() => { deleteUser() }}>
                                Ta bort
                            </button>
                        </div>
                    </div>
            }
        </>


    )
}

export default Person;