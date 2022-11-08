import axios from 'axios';
import React, { useState, useEffect } from "react";
import Person from '../components/DashboardPerson'
import Head from 'next/head'

import Background from '../components/Background'
import Logo from '../components/Logo'

const AddUserButton = ({ handler }) => {
    return (
        <button className='text-white w-72 h-auto hover:border-2 p-4 rounded-lg hover:border-white hover:bg-black/75 duration-150 mb-5 mt-5' onClick={handler}>
            <div className='flex flex-col items-center justify-center gap-5'>
                <p className='text-xl font-bold'>
                    Lägg till användare
                </p>
                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-user-plus" width="52" height="52" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                    <path d="M16 11h6m-3 -3v6" />
                </svg>
            </div>
        </button>

    )
}

const Dashboard = (props) => {
    const [people, setPeople] = useState([]);

    /* When the page is rendered, get all users and create a people component */
    useEffect(() => {
        /* Renders all users to the page after getting users from api */
        axios.get("/api/getusers").then((response) => {

            const peopleFromApi = response.data.map((user) => (
                <Person
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
        let _person = <Person
            name="Ny Användare"
            role="Ny Roll"
            group={props.groups[0]._id}
            privilege={props.privileges[0]._id}
            groups={props.groups}
            privileges={props.privileges}
            group_name={props.groups[0].display_name}
            privilege_name={props.privileges[0].display_name}
            changing={true}
        />
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