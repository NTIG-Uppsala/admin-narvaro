import Link from 'next/link';
import { useRouter } from 'next/router'
import axios from 'axios';
import React, { useState, useEffect } from "react";
import Person from '../components/DashboardPerson'

const Dashboard = (props) => {
    const [people, setPeople] = useState([]);

    const [formValues, setFormValues] = useState([]);
    const [submitOk, setSubmitOk] = useState(false);
    const router = useRouter()
    /* Called whenever a user input is changed */
    const handleInputChange = (event, person) => {
        setSubmitOk(false) /* Reset submitOk */
        let new_form_val = {
            objectId: person._id,
            name: person.name,
            role: person.role,
            privilege: person.privilege,
            group: person.group
        };

        setFormValues((oldFormValues) => {
            /* Searches for person in values */
            let user_found =
                oldFormValues.find((item) => item.objectId == event.target.id) !== undefined;


            /* If person hasn't been changed before, add the user to the list */
            if (!user_found) {
                new_form_val[event.target.name] = event.target.value
                return [...oldFormValues, new_form_val]
            }

            /* If person has already been changed, change its values */
            let new_changed_value = oldFormValues.map(item => {
                if (item.objectId !== event.target.id) {
                    return item;
                }
                else {
                    return {
                        ...item,
                        [event.target.name]: event.target.value,
                    };
                }
            });
            return [...new_changed_value]
        });
    };




    /* When the page is rendered, get all users and create a people component */
    // {...groups}
    // {...privileges}
    // key={index}
    // _id={item._id}
    // name={item.name}
    // role={item.role}
    // privilege_id={item.privilege}
    // group_id={item.group}
    // group_name={groups.find((group) => group._id == item.group_id).display_name}
    // privilege_name={privileges.find((privilege) => privilege._id == item.privilege_id).display_name}
    // onChange={(event) => handleInputChange(event, item)}
    // groups={groups}
    // privileges={privileges}
    useEffect(() => {
        console.log("Get users ")
        // GARL: https: //bobbyhadz.com/blog/react-push-to-state-array
        /* Renders all users to the page after getting users from api */
        axios.get("/api/getusers").then((response) => {

            const peopleFromApi = response.data.map((user, index) => (
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

    /* Called when the client presses the save button  */
    const submit = (values) => {
        axios.post('/api/updateusers', values).then((response) => {
            if (response.status == 200) {
                setFormValues([])
                setSubmitOk(true)
                router.reload(window.location.pathname)
            }
        });
    }

    return (
        <>
            <div className="backgroundImage">
                <img src="images/backgroundNTI.jpg" />
            </div>

            <img id="logo" src="images/nti_logo_footer.svg" alt="" />

            <div className="grid-center">
                <div className="message-container-wrapper">
                    <div id="main">
                        <h1>Administration</h1>
                        {(people.length == 0) ?
                            <h1>Laddar innehållet..</h1> : people}
                    </div>

                    <div className='center-button'>
                        {
                            (formValues.length != 0) ?
                                <>
                                    <Link href="/dashboard" >
                                        <a onClick={() => submit(formValues)} className="save-button">Spara</a>
                                    </Link>
                                    <Link href={'/dashboard'} >
                                        <a onClick={() => { router.reload(window.location.pathname) }} className="save-button red-button">Avbryt</a>
                                    </Link>
                                </>
                                : null
                        }
                        {
                            (submitOk) ? <p>Ändring lyckades!</p> : null
                        }
                    </div>

                </div>
            </div>
        </>
    );
}

export const getServerSideProps = async (context) => {
    let URL = (process.env.NODE_ENV !== 'production') ? 'http://localhost:8000/' : 'https://narvaro.ntig.net/';
    let response = await axios.get(`${URL}/api/isloggedin`, {
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