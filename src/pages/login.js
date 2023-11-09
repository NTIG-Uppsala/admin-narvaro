import axios from "axios";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Container } from "../components/Containers";
import Background from "../components/Background";
import Logo from "../components/Logo";
import { setCookie } from "cookies-next";

import { EyeIcon, EyeLineIcon, LockIcon } from "../components/Icons";

const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [correctPassword, setCorrectPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const tryLogin = (e) => {
    if (e.type == "click" || (e.type == "keypress" && e.key == "Enter")) {
      axios
        .post("/api/auth/login", { password: password })
        .then((res) => {
          console.log(res.data.token);
          console.log(res.status);
          if (res.status > 400) {
            setCorrectPassword(false);
          } else {
            setCorrectPassword(true);
            setCookie("token", res.data.token);
            router.push("/dashboard");
          }
        })
        .catch((err) => {
          if (err.response.status > 400) {
            setCorrectPassword(false);
          }
        });
    }
  };

  const updateState = (e) => {
    setPassword(e.target.value);
    console.log(password);
  };

  return (
    <>
      <Head>
        <title>Logga in</title>
      </Head>

      <Background />
      <Logo />
      <div className="h-screen w-full grid place-items-center">
        <Container>
          <div className="flex flex-col w-full justify-center items-center gap-y-6 p-12">
            <h1 className="font-lg text-5xl font-bold">Logga in</h1>
            {/* <div>
                            <label className="flex flex-row justify-center w-full items-center border-2 border-white rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-user-circle" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <circle cx="12" cy="12" r="9" />
                                    <circle cx="12" cy="10" r="3" />
                                    <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
                                </svg>
                                <input type="text" placeholder="Användarnamn" disabled value={'admin'} className="bg-transparent rounded-md p-2" />
                            </label>
                        </div> */}
            <div>
              <div className="flex flex-row w-full justify-center items-center rounded-lg border-2 border-white">
                <LockIcon />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Lösenord"
                  className="bg-transparent rounded-md p-2 focus:outline-none"
                  onKeyPress={tryLogin}
                  onChange={updateState}
                />
                <button
                  id="show-password"
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                  className="mr-2"
                >
                  {showPassword ? <EyeLineIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div>
              <button
                className="bg-transparent border-[3px] p-3 duration-150 hover:bg-slate-100 hover:text-black border-white text-white rounded-md"
                id="loginButton"
                onClick={tryLogin}
              >
                Logga in
              </button>
            </div>
            <div className="flex flex-row">
              {correctPassword === false ? (
                <>
                  <img
                    src="/images/danger.svg"
                    alt="varningstecken"
                    className="mr-2"
                  />
                  <span>Fel lösenord</span>
                </>
              ) : null}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export const getServerSideProps = async (context) => {
  try {
    let response = await axios.get(
      `${process.env.HOST_URL}api/auth/authorize`,
      {
        headers: {
          Authorization: `Bearer ${context.req.cookies.token}`,
        },
      }
    );
    if (response.status === 200)
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
  } catch (error) {
    return { props: {} };
  }
};

export default LoginPage;
