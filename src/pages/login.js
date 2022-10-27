import Login from '../components/login';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import Head from 'next/head'
export default () => {

    const [password, setPassword] = useState("");
    const [correctPassword, setCorrectPassword] = useState();
    const router = useRouter()

    const tryLogin = (e) => {
        if ((e.type == "click") || (e.type == "keypress" && e.key == 'Enter'))
        {
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
        var inputField = document.getElementById("password");
        var showPasswordButton = document.getElementById("show-password");
        if (inputField.type === "password") {
            inputField.type = "text";
            showPasswordButton.style.backgroundImage = "url('/images/eye-dash.svg')";
        } else {
            inputField.type = "password";
            showPasswordButton.style.backgroundImage = "url('/images/eye.svg')";
        }
    }

    return (
        <>
            <Head>
                <title>Logga in</title>
            </Head>
            <div className="backgroundImage">
                <img src="/images/backgroundNTI.jpg" />
            </div>

            <img id="logo" src="images/nti_logo_footer.svg" alt="" />
            <div className="grid-center">
                <div className="login-container-wrapper">
                    <div className="login-container">
                        <h1>Logga In</h1>
                        <div className="password">
                            <div className='buttonIn'>
                                <input type="password" id="password" name='password' onKeyPress={tryLogin} onChange={updateState} placeholder="Lösenord" /><br />
                                <button id="show-password" onClick={passwordState}></button>
                            </div>
                            <div className="incorrect-password">
                                {correctPassword === false ?
                                    <>
                                        <img src="/images/danger.svg" alt="varningstecken" />
                                        <span>Fel lösenord</span>
                                    </>
                                    : null
                                }
                            </div>
                        </div>
                        <div>
                            <button id="login-button" onClick={tryLogin}>Logga in</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

