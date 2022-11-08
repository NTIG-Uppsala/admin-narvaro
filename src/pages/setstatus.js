import Link from 'next/link';
import axios from 'axios';
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
import Head from 'next/head';


import Background from '../components/Background'
import Logo from '../components/Logo'
import { Container } from '../components/Containers'
import Checkbox from '../components/CheckboxSlider'

const Person = (props) => {
    return (
        <div className={((props.id % 2 == 0) ? "bg-stone-700/50" : "") + " flex flex-row gap-[50px] items-center justify-between  pt-3 pb-3 md:pt-6 md:pb-6 px-4"}>
            <div id="name" className="text-left mr-5">
                <p className="text-lg md:text-3xl">{props.name}</p>
            </div>
            <div id="slider" className="text-right ml-5">
                <Checkbox _id={props._id} name={props.name} status={props.status} />
            </div>
        </div>
    )
}

/* Render the person */

const Input = (props) => {
    const socket = io();
    const [people, setPeople] = useState(props.users);
    const [verified, setVerified] = useState(props.verified);

    /* 
        When the Page is loaded
        - add a socket listener for status update
    */
    useEffect(() => {
        socket.on('status update', () => {
            console.log("STATUS UPDATE")
            axios.post('/api/verifyurl', { uri: props.uri }).then(res => {
                console.log(res.data)
                setVerified(res.data.verified)
                setPeople(() => {
                    if (res.data.verified === true) {
                        return res.data.users;
                    }
                })

            });
        });
    }, []);



    return (
        <>
            <Head>
                <title>Sätt status</title>
            </Head>
            <Background />
            <Logo />
            <div className="h-screen w-full grid place-items-center">
                <Container>
                    {(!verified) ?
                        <>
                            <h3>Tillträde förbjuden</h3>
                            <p>Vänligen kolla så att din adress är korrekt</p>
                        </>
                        :
                        <>
                            <h1 className="font-lg text-3xl font-bold text-center">Set status</h1>
                            <div className="flex flex-col md:pt-12">
                                {
                                    people && people.map((item, index) => {
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

                                }
                            </div>
                            <Link href="/">
                                <a id="status-link-hover" className='text-center font-2xl font-bold pt-5 hover:text-slate-300 duration-100'>Visa Status</a>
                            </Link>
                        </>
                    }
                </Container>
            </div >
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
                users: res.data.users,
                uri: context.query.auth
            }
        }
    }
}
export default Input;