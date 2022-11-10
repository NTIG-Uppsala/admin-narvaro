import Link from 'next/link';
import axios from 'axios';
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
import Head from 'next/head';

import Background from '../components/Background'
import Logo from '../components/Logo'
import { Container } from '../components/Containers'

const Person = (propscomp) => {
    const [checked, setChecked] = useState(propscomp.status || false);

    useEffect(() => {
        setChecked(propscomp.status)
    }, [propscomp.status])

    // https://bobbyhadz.com/blog/react-check-if-checkbox-is-checked
    const handleCheckboxChange = (event) => {
        let post_body = {
            id: event.target.id,
            status: event.target.checked
        }

        setChecked(event.target.checked)

        axios.post('/api/setstatus', post_body, (res) => { console.log(res) })
        console.log(checked)
    }

    return (
        <div className={((propscomp.id % 2 == 0) ? "bg-stone-700/50" : "") + " flex flex-row gap-[50px] items-center justify-between  pt-3 pb-3 md:pt-6 md:pb-6 px-4"}>
            <div id="name" className="text-left mr-5">
                <p className="text-lg md:text-3xl">{propscomp.name}</p>
            </div>
            <div id="slider" className="text-right ml-5">
                <label htmlFor={propscomp._id} className="inline-flex relative items-center cursor-pointer">
                    <input
                        type="checkbox"
                        id={propscomp._id}
                        onChange={handleCheckboxChange}
                        checked={checked}
                        className="sr-only peer"
                    />
                    <div id={'slider-' + propscomp._id} className="w-11 h-6 bg-red-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500 duration-500"></div>
                </label>

            </div>
        </div>
    )
}

const Input = (propscomp) => {
    const socket = io();
    const [people, setPeople] = useState(propscomp.users || [{}]);
    const [verified, setVerified] = useState(propscomp.verified);

    /* 
        When the Page is loaded
        - add a socket listener for status update
    */
    useEffect(() => {
        socket.on('status update', () => {
            console.log("STATUS UPDATE")
            axios.post('/api/verifyurl', { uri: propscomp.uri }).then(res => {
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
                        <div className='p-6'>
                            <h1 className='font-bold text-3xl'>Tillträde förbjuden!</h1>
                            <p className='text-lg'>Vänligen verifiera länken och försök igen!</p>
                        </div>
                        :
                        <>
                            <h1 className="font-lg text-3xl font-bold text-center">Set status</h1>
                            <div className="flex flex-col md:pt-12">
                                {
                                    people.map((item, index) => {
                                        return <Person
                                            key={index}
                                            id={index + 1}
                                            _id={item._id}
                                            name={item.name}
                                            status={item.status}
                                        />
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