import axios from 'axios';
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';

import { Container } from '../components/Containers'
import Background from '../components/Background'
import Logo from '../components/Logo'

import Head from 'next/head'
import moment from 'moment';
import 'moment/locale/sv';
moment.locale('sv')

const Person = (props) => {
    const [latest_change, setLatestChange] = useState(() => moment(props.latest_change).fromNow());

    const update_latest_change = () => setLatestChange(() => moment(props.latest_change).fromNow());
    useEffect(() => {
        /* Will update the from Last Updated text every minute */
        setInterval(update_latest_change, 60000);
    }, [])

    useEffect(() => {
        update_latest_change()
    }, [props.latest_change])


    return (
        <div className={((props.id % 2 == 0) ? "bg-stone-700/50" : "") + " flex flex-row gap-[50px] justify-between pt-3 pt:3 md:pt-6 md:pb-6 sm:pb-4 sm:pt-4"}>
            <div id="name" className="text-left mr-5">
                <p className="text-xl md:text-3xl break-keep">{props.name}</p>
                <span className="text-xs md:text-lg ">{props.role}</span>
            </div>
            <div id="status" className="text-right">
                <p className={"text-xl md:text-3xl" + ((props.status) ? " text-[#00ff00]" : " text-[#ff0000]")} id={props._id}>
                    {(props.status) ? "Tillgänglig" : "Ej tillgänglig"}
                </p>
                <span className="text-xs md:text-lg">Senast Uppdaterad:<br />{latest_change}</span>
            </div>
        </div>
    )
}

const WebPage = (props) => {
    const [people, setPeople] = useState(props.users)

    const socket = io();

    /* Will be runned as a client side script when the page renders */
    useEffect(() => {
        socket.on('status update', (response) => {
            console.log("STATUS UPDATE: \n", response)
            axios.get('/api/getusers').then(res => {
                console.log("data gotten from api: \n", res.data)
                setPeople(res.data)
            });
        });
    }, []);

    return (
        <>
            <Head>
                <title>Administrationsstatus</title>
            </Head>
            <Background />
            <Logo />

            <div className="h-screen w-full grid place-items-center">
                <Container>
                    <h1 className="font-lg text-5xl font-bold text-center">Status</h1>
                    <div className="flex flex-col md:pt-12">
                        {people && people.map((item, index) => { return <Person key={index} id={index + 1} {...item} /> })}
                    </div>
                </Container>

            </div>

        </>
    )
}

export async function getServerSideProps(context) {
    let response = await axios.get(`${process.env.HOST_URL}api/getusers`)

    return {
        props: {
            users: response.data
        }
    }
}

export default WebPage;