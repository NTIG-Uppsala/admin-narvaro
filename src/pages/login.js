import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Container } from "../components/Containers";
import Background from "../components/Background";
import Logo from "../components/Logo";
export default () => {

    const [password, setPassword] = useState("");
    const [correctPassword, setCorrectPassword] = useState();
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter()

    const tryLogin = (e) => {
        if ((e.type == "click") || (e.type == "keypress" && e.key == 'Enter')) {
            axios.post('/api/verifylogin', { password: password }).then(res => {
                console.log(res.data.result)
                if (res.data.result === true) {
                    setCorrectPassword(true)
                    router.push('/dashboard')
                } else {
                    setCorrectPassword(false)
                }
            })
        }
    }

    const updateState = (e) => {
        setPassword(e.target.value)
        console.log(password)
    }

    /* Changes password visibility */

    const passwordState = () => {
        setShowPassword(!showPassword)
    }

    return (
        <>
            <Head>
                <title>Logga in</title>
            </Head>

            <Background />
            <Logo />
            <div className="h-screen w-full grid place-items-center">
                <Container>
                    <div className="flex flex-col w-full justify-center items-center gap-4">
                        <h1 className="font-lg text-5xl font-bold text-center">Logga in</h1>
                        {/* <div>
                            <label className="flex flex-row justify-center w-full items-center border-2 border-white rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-user-circle" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <circle cx="12" cy="12" r="9" />
                                    <circle cx="12" cy="10" r="3" />
                                    <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
                                </svg>
                                <input type="text" placeholder="Användarnamn" disabled value={'admin'} className="bg-transparent rounded-md p-2" />
                            </label>
                        </div> */}
                        <div>
                            <label className="flex flex-row w-full justify-center items-center rounded-lg border-2 border-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <rect x="5" y="11" width="14" height="10" rx="2" />
                                    <circle cx="12" cy="16" r="1" />
                                    <path d="M8 11v-4a4 4 0 0 1 8 0v4" />
                                </svg>
                                <input type={(showPassword) ? 'text' : 'password'} name='password' id='password' placeholder="Lösenord" className="bg-transparent rounded-md p-2 focus:outline-none" onKeyPress={tryLogin} onChange={updateState} />
                                <button id='show-password' onClick={() => { setShowPassword(!showPassword) }} className='mr-2'>
                                    {
                                        (showPassword) ?
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <line x1="3" y1="3" x2="21" y2="21" />
                                                <path d="M10.584 10.587a2 2 0 0 0 2.828 2.83" />
                                                <path d="M9.363 5.365a9.466 9.466 0 0 1 2.637 -.365c4 0 7.333 2.333 10 7c-.778 1.361 -1.612 2.524 -2.503 3.488m-2.14 1.861c-1.631 1.1 -3.415 1.651 -5.357 1.651c-4 0 -7.333 -2.333 -10 -7c1.369 -2.395 2.913 -4.175 4.632 -5.341" />
                                            </svg>
                                            :
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <circle cx="12" cy="12" r="2" />
                                                <path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7" />
                                            </svg>
                                    }
                                </button>
                            </label>
                        </div>
                        <div>
                            <button className="bg-transparent border-[3px] p-3 duration-150 hover:bg-slate-100 hover:text-black border-white text-white rounded-md" onClick={tryLogin}>Logga in</button>
                        </div>
                        <div className="flex flex-row">
                            {correctPassword === false ?
                                <>
                                    <img src="/images/danger.svg" alt="varningstecken" className='mr-2' />
                                    <span>Fel lösenord</span>
                                </>
                                : null
                            }
                        </div>
                    </div>
                </Container>
            </div>
        </>
    )
}

