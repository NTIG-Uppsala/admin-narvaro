import axios from "axios";
import { useState, useEffect } from "react";
import io from "socket.io-client";

import { Container } from "../components/Containers";
import Background from "../components/Background";
import Logo from "../components/Logo";
import Te4logo from "../components/te4logo";

import Head from "next/head";
import moment from "moment";
import "moment/locale/sv";
moment.locale("sv");

const WebPage = (props) => {
  const [people, setPeople] = useState(props.users);
  const Person = (propscomp) => {
    const [latest_change, setLatestChange] = useState(
      moment(propscomp.latest_change).fromNow()
    );

    useEffect(() => {
      /* Will update the "from Last Updated" text every minute */
      let inter = setInterval(() => {
        setLatestChange(moment(propscomp.latest_change).fromNow());
      }, 60000);
      return () => clearInterval(inter);
    }, []);

    useEffect(() => {
      setLatestChange(moment(propscomp.latest_change).fromNow());
    }, [propscomp.latest_change]);

    const isLastChild = propscomp.isLastChild;

    return (
      <div
        className={
          (propscomp.id % 2 === 0 ? "bg-stone-700/50" : "") +
          " flex flex-row pr-6 pl-6 md:gap-x-32 lg:gap-x-64 justify-between items-center py-6 px-3 md:py-3" +
          (isLastChild ? " rounded-b-lg" : "")
        }
      >
        <div className="text-left mr-5">
          <p className="text-xl md:text-3xl break-keep">{propscomp.name}</p>
          <span className="text-xs md:text-sm lg:text-base">
            {propscomp.role}
          </span>
        </div>
        <div className="text-right">
          <p
            className={
              "text-xl md:text-3xl" +
              (propscomp.status ? " text-[#00ff00]" : " text-[#ff0000]")
            }
            id={propscomp._id}
          >
            {propscomp.status ? "Tillgänglig" : "Ej tillgänglig"}
          </p>
          <span className="text-xs md:text-sm lg:text-base">
            Senast Uppdaterad:
            <br />
            {latest_change}
          </span>
        </div>
      </div>
    );
  };

  const socket = io();

  /* Will be runned as a client side script when the page renders */
  useEffect(() => {
    socket.on("status update", (response) => {
      console.log("STATUS UPDATE: \n", response);
      axios.get("/api/get/users").then((res) => {
        console.log("data gotten from api: \n", res.data);
        setPeople(res.data);
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

      <Te4logo />

      <div className="h-screen w-full grid place-items-center">
        <Container>
          <h1 className="font-lg text-5xl font-bold text-center">Status</h1>
          <noscript>
            <p className="text-center">
              Du har inte javascript aktiverat. Detta kan orsaka att webplatsen
              inte fungerar som den ska
            </p>
          </noscript>
          <div className="flex flex-col md:pt-12">
            {people &&
              people.map((item, index) => {
                const isLastChild = index === people.length - 1;
                return (
                  <Person
                    key={index}
                    id={index + 1}
                    isLastChild={isLastChild}
                    {...item}
                  />
                );
              })}
          </div>
        </Container>
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  let response = await axios.get(`${process.env.HOST_URL}api/get/users`);

  return {
    props: {
      users: response.data,
    },
  };
}

export default WebPage;
