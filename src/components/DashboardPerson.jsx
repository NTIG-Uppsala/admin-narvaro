import axios from 'axios';
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'


const NameField = (props) => {
    return (
        <>
            {(!props.changing) ?
                <h1 className="person-info">{props.value}</h1>
                :
                <input type="text" value={props.value} onChange={props.onChangeHandler} />
            }
        </>
    )
}

const RoleField = (props) => {
    return (
        <>
            {(!props.changing) ?
                <h2 className="person-info">{props.value}</h2>
                :
                <input type="text" className='role' value={props.value} onChange={props.onChangeHandler} />
            }

        </>
    )
}

const PrivilegeField = (props) => {
    return (
        <>
            <div className="menu-text">
                Behörighet
            </div>
            {(!props.changing) ?
                <div className="rights">
                    {props.value}
                </div>
                :
                <select className="dropdown-menu" defaultValue={props.privilege} onChange={props.onChangeHandler} id={props.id}>
                    {
                        props.privileges.map((privilege, index) => {
                            return <option key={privilege._id} value={privilege._id} >{privilege.display_name}</option>
                        })
                    }
                </select>

            }

        </>
    )

}

const GroupField = (props) => {
    return (
        <>
            <div className="menu-text">
                Grupp
            </div>
            {(!props.changing) ?
                <div className="rights">
                    {props.value}
                </div>
                :
                <select className="dropdown-menu" id={props.id} defaultValue={props.group} onChange={(e) => { setPerson({ ...person, group: e.target.value }) }}>
                    {
                        props.groups.map((group, index) => {
                            return <option key={group._id} value={group._id}>{group.display_name}</option>
                        })
                    }
                </select>

            }

        </>
    )


}

const URLField = (props) => {
    return (
        <>
            {(!props.changing) ?
                <div className="link-border">
                    <Link href={"https://narvaro.ntig.net/setstatus?auth=" + props.value}>
                        <a target='_blank' >
                            {"https://narvaro.ntig.net/setstatus?auth=" + props.value}
                        </a>
                    </Link>
                    <button className="refresh-button" onClick={props.copyLinkHandler} >
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-copy" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <rect x="8" y="8" width="12" height="12" rx="2" />
                            <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
                        </svg>
                    </button>
                </div>
                :
                <div className="menu menu-left title link-border">
                    {(props.value) ?
                        <p>
                            {"https://narvaro.ntig.net/setstatus?auth=" + props.value}
                        </p>
                        :
                        props.onChangeHandler(true)
                    }
                    <button className="refresh-button" onClick={props.onChangeHandler}>
                        <img src="images/refresh.svg" alt="hämta om knapp"></img>
                    </button>
                    <button className="refresh-button" onClick={props.copyLinkHandler}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-copy" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <rect x="8" y="8" width="12" height="12" rx="2" />
                            <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
                        </svg>
                    </button>
                    
                </div>


            }

        </>
    )
}

const Buttons = (props) => {
    return (
        <>
            {(!props.changing) ?
                <div class="button-rights-container">
                    {
                        (props._id !== -1) ? <button className="rights" onClick={props.onChangeHandler}>Redigera</button> : null
                    }
                </div>
                :
                <div className="menu title">
                    {
                        (props._id !== undefined) ? <button className="back-button" onClick={props.onChangeHandler}><img src="images/back.svg" alt="tillbaka knapp"></img></button> : null
                    }
                    <button className="save-button" onClick={props.SubmitHandler}>
                        Spara
                    </button>
                    <button className="delete-button" onClick={props.DeletHandler}>
                        <img src="images/trash.svg" alt="ta bort knapp"></img>
                    </button>
                </div>
            }
        </>
    )
}



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

        if (typeof window !== 'undefined') {
            if (window.confirm("Är du säker på att du vill ta bort " + person.name + "?")) {
                return axios.post('/api/deleteuser', { user: person }).then((response) => {
                    if (response.status == 200) {
                        console.log("success")
                        setChanging(false)
                        setSubmitOk(true)
                    }
                    Router.reload()
                });
            }
        }    
    }

    useEffect(() => { console.log(person) }, [person])

    const new_uri = (new_user) => {
        let uri = (len) => {
            let result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < len; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        let _NEW = uri(10);

        if (new_user === true) {
            setPerson({ ...person, uri: _NEW })
        }
        else {
            if (typeof window !== 'undefined') {
                let confirm = window.confirm("Är du säker på att du vill generera en ny länk? Den gamla länken kommer inte att fungera längre.")
                if (confirm === true) {
                    setPerson({ ...person, uri: _NEW })
                }
            }
        }
        // navigator.clipboard.writeText(`https://narvaro.ntig.net/setstatus?auth=${_NEW}`)
    }

    const copyURIToClipboard = () => {
        navigator.clipboard.writeText(`https://narvaro.ntig.net/setstatus?auth=${person.uri}`)
        alert("Länken till "+ person.name+ " har kopierats till urklipp")
    }

    return (
        <>
            <div >
                <NameField
                    value={person.name}
                    changing={changing}
                />
                <RoleField
                    value={person.role}
                    changing={changing}
                />
                <PrivilegeField
                    id={person._id}
                    value={person.privilege_name}
                    changing={changing}
                    privilege={person.privilege_id}
                    privileges={props.privileges}
                    onChangeHandler={(e) => { setPerson({ ...person, privilege_id: e.target.value }) }}
                />
                <GroupField
                    id={person._id}
                    value={person.group_name}
                    changing={changing}
                    group={person.group_id}
                    groups={props.groups}
                    onChangeHandler={(e) => { setPerson({ ...person, group_id: e.target.value }) }}
                />
                <URLField
                    value={person.uri}
                    changing={changing}
                    onChangeHandler={(new_user) => { new_uri(new_user) }}
                    copyLinkHandler={copyURIToClipboard}
                />
                <Buttons
                    _id={person._id}
                    changing={changing}
                    onChangeHandler={() => { setChanging(!changing) }}
                    SubmitHandler={() => { submit() }}
                    DeletHandler={() => { deleteUser() }}
                />
            </div>
        </>


    )
}

export default Person;