import axios from 'axios';
import React, { useState, useEffect } from "react";
import Person from '../components/DashboardPerson'
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
            <div className="backgroundImage">
                <img src="images/backgroundNTI.jpg" />
            </div>

            <div id="main" className='dashboard-container'>
                {(people.length == 0) ?
                    <h1>Laddar innehållet..</h1> : people}
                <div style={{ border: 'none', backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                    <button onClick={newPerson} className="add-button">
                        <img src="/images/add-user.svg"></img>
                    </button>
                </div>


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

        let privileges = await axios.get(`${URL}/api/getprivileges`)
        let groups = await axios.get(`${URL}/api/getgroups`)
        return {
            props: {
                groups: groups.data,
                privileges: privileges.data
            }
        }
    }
}

export default Dashboard;