import Link from 'next/link';
import axios from 'axios';
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
import { useRouter } from 'next/router'

import Person from '../components/SetPersonStatus';

import Head from 'next/head';

const Input = (props) => {
    const socket = io();
    const [people, setPeople] = useState([]);
    const [verified, setVerified] = useState(props.verified);

    const router = useRouter()

    /* 
        When the Page is loaded
        - add a socket listener for status update
    */
    useEffect(() => {
        if (router.isReady) {
            socket.on('status update', () => {
                console.log("STATUS UPDATE")
                axios.post('/api/verifyurl', { uri: router.query.auth }).then(res => {
                    setVerified(res.data.verified)
                    setPeople(() => {
                        return render_people(res.data.users)
                    })

                });
            });
        }
    }, [router.isReady]);

    useEffect(() => {
        setPeople(() => {
            return render_people(props.users)
        })
    }, [])

    /* Render the person */
    const render_people = (person_object) => {
        if (person_object.length < 1) {
            return [];
        }
        else {
            return person_object.map((item, index) => {
                return (
                    <Person
                        key={index}
                        id={index + 1}
                        _id={item._id}
                        name={item.name}
                        status={item.status}
                    />
                )
            })
        };
    }


    return (
        <>
            <Head>
                <title>Sätt status</title>
            </Head>

            <div className="backgroundImage">
                <img src="images/backgroundNTI.jpg" alt="bakgrunds bild på hemsidan" />
            </div>

            <img id="logo" src="images/nti_logo_footer.svg" alt="ntis logga" />

            <div className="grid-center">
                <div className="message-container-wrapper">
                    {(!verified) ?
                        <>
                            <h3>Tillträde förbjuden</h3>
                            <p>Vänligen kolla så att din adress är korrekt</p>
                        </>
                        :
                        <>
                            <div id="main">
                                <h1>Ange din status</h1>
                                {(!people.length) ?
                                    <p>Laddar innehållet..</p>
                                    :
                                    people
                                }
                            </div>
                            <div>
                                <Link href="/">
                                    <a id="status-link-hover">Visa Status</a>
                                </Link>
                            </div>
                        </>
                    }
                </div>
            </div>
        </>
    );
}

/* Before the pages loads, ask api */
export const getServerSideProps = async (context) => {
    if (context.query == '' || context.query === undefined) {
        return {
            props: {
                verified: false,
                users: false
            }
        }
    }
    else {
        let res = await axios.post(`${process.env.HOST_URL}api/verifyurl`, { uri: context.query.auth })
        return {
            props: {
                verified: res.data.verified,
                users: res.data.users
            }
        }
    }
}
export default Input;