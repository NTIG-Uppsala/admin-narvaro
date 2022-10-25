import Login from '../components/login';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
export default () => {

    const [password, setPassword] = useState("");
    const [correctPassword, setCorrectPassword] = useState();
    const tryLogin = () => {
        console.log("trylogin", password)
        axios.post('/api/verifylogin', { password: password }, { withCredentials: true }).then(res => {
            console.log(res.data.result)
            if (window !== undefined && res.result === true) {
                window.location.href = '/dashboard';
            }
        })

    }

    const updateState = (e) => {
        setPassword(e.target.value)
        console.log(password)
    }

    return (
        <>
            <div className="backgroundImage">
                <img src="/images/backgroundNTI.jpg" />
            </div>

            <img id="logo" src="images/nti_logo_footer.svg" alt="" />
            <div className="grid-center">
                <div className="message-container-wrapper">
                    <div className="login-container">
                        <h1>Logga In</h1>
                        <div className="password">
                            <input type="password" id="password" name='password' onChange={updateState} placeholder="Lösenord" /><br />
                            <div className="incorrect-password">
                                {correctPassword === false ?
                                    <>
                                        <img src="/images/danger.svg" alt="picture of eye" />
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

