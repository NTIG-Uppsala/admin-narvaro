import axios from 'axios';
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';

/* import Person from '../components/PersonStatus' */
import { Container } from '../components/Containers'
import Background from '../components/Background'
import Logo from '../components/Logo'

import Head from 'next/head'
import moment from 'moment';
import 'moment/locale/sv';

const Person = (props) => {
    const [latest, setLatest] = useState(props.latest_change)
    const [latest_change, setLatestChange] = useState(() => { return moment(props.latest_change).fromNow() });

    moment.locale('sv')
    const update_latest_change = () => {
        return setLatestChange(moment(latest).fromNow())
    }

    useEffect(() => {
        console.log("useEffect in person")
        /* Will update the from now every minute */
        setLatestChange(() => { return moment(props.latest_change).fromNow() })

        setInterval(update_latest_change, 60000);

    }, [props.latest_change])


    return (
        <div className={((props.id % 2 == 0) ? "bg-stone-700/50" : "") + " flex flex-row gap-[50px] justify-between pt-3 pt:3 md:pt-6 md:pb-6 sm:pb-4 sm:pt-4"}>
            <div id="name" className="text-left mr-5">
                <p className="text-lg md:text-3xl break-keep">{props.name}</p>
                <span className="text-xs md:text-lg ">{props.role}</span>
            </div>
            <div id="status" className="text-right">
                <p className={"text-lg md:text-3xl" + ((props.status) ? " text-[#00ff00]" : " text-[#ff0000]")} id={props._id}>
                    {(props.status) ? "Tillgänglig" : "Ej tillgänglig"}
                </p>
                <span className="text-xs md:text-lg">Senast Uppdaterad:<br />{moment(props.latest_change).fromNow()}</span>
            </div>
        </div>
    )
}

const Output = () => {
    const [statusArray, setStatusArray] = useState();

    const socket = io();

    /* Will be runned as a client side script when the page renders */
    useEffect(() => {
        axios.get('/api/getusers').then(res => {
            console.log("data gotten from api: \n", res.data)

            return render_people(res.data)
        });

        socket.on('status update', (response) => {
            console.log("STATUS UPDATE: \n", response)
            axios.get('/api/getusers').then(res => {
                console.log("data gotten from api: \n", res.data)
                return render_people(res.data)
            });
        });
    }, []);

    /* Used to update content on page */
    function render_people(person_object) {
        let people_elements = [];
        console.log(person_object)
        person_object.forEach((item, index) => {
            let new_element = <Person
                key={index}
                id={index + 1}
                _id={item._id}
                name={item.name}
                role={item.role}
                status={item.status}
                avalibility={(item.status == true) ? "Tillgänglig" : "Ej tillgänglig"}
                latest_change={item.latest_change}
            />
            people_elements.push(new_element)
        });
        setStatusArray(people_elements)
    }

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
                        {(statusArray === undefined) ?
                            <h1>Laddar innehållet..</h1> : statusArray}

                    </div>
                </Container>

            </div>

        </>
    )
}

export default Output;