import axios from 'axios';
import React, { useState, useEffect } from "react";
import Head from 'next/head'
import { useRouter } from 'next/router'
import Background from '../components/Background'
import Logo from '../components/Logo'
import { DashboardContainer } from '../components/Containers'

const AddUserButton = ({ handler }) => {
    return (
        <button className='text-white w-72 h-auto hover:border-2 p-4 rounded-lg hover:border-white hover:bg-black/75 duration-150 mb-5 mt-5' onClick={handler}>
            <div className='flex flex-col items-center justify-center gap-5'>
                <p className='text-xl font-bold'>
                    Lägg till användare
                </p>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-user-plus" width="52" height="52" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                    <path d="M16 11h6m-3 -3v6" />
                </svg>
            </div>
        </button>

    )
}


const EditButton = ({ onClickHandler }) => {
    return (
        <button className='bg-transparent text-white border-2 p-4 rounded-lg border-white mb-5 mt-5' onClick={onClickHandler}>
            <div className='flex flex-row gap-5'>
                Redigera
                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-pencil" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" />
                    <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
                </svg>
            </div>
        </button>
    )
}

const BackButton = ({ onClickHandler }) => {
    return (
        <button className='bg-transparent text-white mx-4 border-2 p-4 rounded-lg border-white mb-5 mt-5' onClick={onClickHandler}>
            Tillbaka
        </button>
    )
}

const SaveButton = ({ onClickHandler }) => {
    return (
        <button className='bg-transparent mx-4 text-white border-2 p-4 rounded-lg border-white mb-5 mt-5' onClick={onClickHandler}>
            Spara
        </button>
    )
}

const DeleteButton = ({ onClickHandler }) => {
    return (
        <button className='bg-transparent mx-4 text-white border-2 p-4 rounded-lg border-white mb-5 mt-5' onClick={onClickHandler}>
            Ta bort
        </button>
    )
}



const InputField = (props) => {
    return (
        <input type='text' className='bg-transparent text-white border-b-4 border-white mb-5 mt-5' value={props.value} placeholder={props.placeholder} onChange={props.onChangeHandler} />
    )
}

const Select = ({ options, defaultSelected, onChangeHandler }) => {
    return (
        <select className='bg-transparent text-white border-2 p-4 rounded-lg border-white mb-5 mt-5' defaultValue={defaultSelected} onChange={onChangeHandler}>
            {options.map((option) => {
                return (
                    <option className='bg-black text-white' value={option._id}>{option.display_name}</option>
                )
            })}
        </select>
    )
}


const DashboardItem = (props) => {
    const [person, setPerson] = useState(props);
    const [editing, setEditing] = useState(props.editing || false);
    const Router = useRouter()
    const toggleEditing = () => {
        setEditing(!editing);
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText("https://narvaro.ntig.net/setstatus?auth=" + person.uri);
    }

    const submit = () => {
        axios.post('/api/updateusers', { user: person }).then((response) => {
            if (response.status == 200) {
                console.log("success")
                setEditing(false)
                Router.reload()
            }
        });
    }

    const deleteUser = () => {
        if (typeof window !== 'undefined') {
            if (window.confirm("Är du säker på att du vill ta bort " + person.name + "?")) {
                axios.post('/api/deleteuser', { user: person }).then((response) => {
                    if (response.status == 200) {
                        console.log("success")
                        setEditing(false)
                    }
                    Router.reload()
                });
            }
        }
    }

    const regenerateUri = (new_user) => {
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
    }

    return (

        <DashboardContainer>
            {(editing) ?
                <>

                    <p className='text-lg font-bold'>Ändrar...</p>
                    <div>
                        <InputField placeholder='Namn..' value={person.name} onChangeHandler={(e) => { setPerson({ ...person, name: e.target.value }) }} />
                    </div>
                    <div>
                        <InputField placeholder='Roll..' value={person.role} onChangeHandler={(e) => { setPerson({ ...person, role: e.target.value }) }} />
                    </div>
                    <div>
                        <p className='text-2xl uppercase font-bold'>Behörighet</p>
                        <Select options={person.privileges} defaultSelected={person.privilege} onChangeHandler={(e) => { setPerson({ ...person, privilege_id: e.target.value }) }} />
                    </div>
                    <div>
                        <p className='text-2xl uppercase font-bold'>Grupp</p>
                        <Select options={person.groups} defaultSelected={person.group} onChangeHandler={(e) => { setPerson({ ...person, privilege_id: e.target.value }) }} />
                    </div>
                    <div>
                        <p className='text-2xl uppercase font-bold'>Personlig Länk</p>
                        <div className='flex flex-row gap-3 bg-transparent text-white border-b-4 w-auto border-white mb-5 mt-5'>
                            {(person.uri) ? <p>https://narvaro.ntig.net/setstatus?auth={person.uri}</p> : regenerateUri(true)}
                            <button onClick={regenerateUri}>
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-refresh" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                                    <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                                </svg>
                            </button>
                            <button onClick={copyToClipboard}>
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-copy" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <rect x="8" y="8" width="12" height="12" rx="2" />
                                    <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className='text-center'>
                        <BackButton onClickHandler={toggleEditing} />
                        <SaveButton onClickHandler={submit} />
                        <DeleteButton onClickHandler={deleteUser} />
                    </div>
                </>
                :
                <>

                    <div>
                        <p className='text-3xl mb-2'>{person.name}</p>
                        <p className='text-2xl'>{person.role}</p>

                    </div>
                    <div>
                        <p className='text-2xl font-bold'>Behörighet</p>
                        <p className='bg-transparent text-white border-2 p-4 rounded-lg border-white mb-5 mt-5'>{person.privilege_name}</p>
                    </div>
                    <div>
                        <p className='text-2xl uppercase font-bold'>Grupp</p>
                        <p className='bg-transparent text-white border-2 p-4 rounded-lg border-white mb-5 mt-5'>{person.group_name}</p>
                    </div>
                    <div>
                        <p className='text-2xl uppercase font-bold'>Personlig Länk</p>
                        <div className='flex flex-row gap-3 bg-transparent text-white border-b-4 w-auto border-white mb-5 mt-5'>
                            <p>https://narvaro.ntig.net/setstatus?auth={person.uri}</p>
                            <button onClick={copyToClipboard}>
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-copy" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <rect x="8" y="8" width="12" height="12" rx="2" />
                                    <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
                                </svg>

                            </button>
                        </div>
                    </div>
                    <div className='text-center'>
                        <EditButton onClickHandler={toggleEditing} />
                    </div>
                </>
            }

        </DashboardContainer>

    )
}

const Dashboard = (props) => {
    const [people, setPeople] = useState([]);

    /* When the page is rendered, get all users and create a people component */
    useEffect(() => {
        /* Renders all users to the page after getting users from api */
        axios.get("/api/getusers").then((response) => {

            const peopleFromApi = response.data.map((user) => (
                <DashboardItem
                    key={user.id}
                    {...user} // object of user values from api
                    groups={props.groups}
                    privileges={props.privileges}
                    group_name={props.groups.find((group) => group._id == user.group).display_name}
                    privilege_name={props.privileges.find((privilege) => privilege._id == user.privilege).display_name}
                />
            ));
            setPeople(peopleFromApi);
        });
    }, []);

    const newPerson = () => {
        let _person = (
            <DashboardItem
                key={people.length}
                name="Ny Användare"
                role="Ny Roll"
                group={props.groups[0]._id}
                privilege={props.privileges[0]._id}
                groups={props.groups}
                privileges={props.privileges}
                group_name={props.groups[0].display_name}
                privilege_name={props.privileges[0].display_name}
                editing={true}
            />
        )
        setPeople([...people, _person]);
    }

    return (
        <>
            <Head>
                <title>Administration</title>
            </Head>

            <Background />
            <Logo />

            <div className="h-screen w-full flex flex-wrap justify-center py-5 gap-[50px]">
                {(people.length == 0) ? <h1>Laddar innehållet..</h1> : people}

                <AddUserButton handler={newPerson} />
            </div>
        </>
    );
}

export const getServerSideProps = async (context) => {
    let response = await axios.get(`${process.env.HOST_URL}api/isloggedin`, {
        headers: {
            cookie: context.req.headers.cookie
        }
    });
    console.log("response", response.data)
    if (response.data.result !== true) {

        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        }
    }
    else {

        let privileges = await axios.get(`${process.env.HOST_URL}/api/getprivileges`)
        let groups = await axios.get(`${process.env.HOST_URL}/api/getgroups`)
        return {
            props: {
                groups: groups.data,
                privileges: privileges.data
            }
        }
    }
}

export default Dashboard;