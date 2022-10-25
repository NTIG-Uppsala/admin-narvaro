import Login from '../components/login';
import axios from 'axios';
import React, {useState, useEffect} from 'react';
import {setCookie} from 'cookies-next';
export default () => {

    const [password, setPassword] = useState("");

    const tryLogin = () => {
        console.log("trylogin", password)
        axios.post('/api/verifylogin', {password: password}).then(res => {
            console.log(res.data)
            setCookie('is_logged_in', res.data);
            if (window !== undefined) {
                window.location.href = '/dashboard';
            }
        })

    }

    const updateState = (e) => {
        setPassword(e.target.value)
        console.log(password)
    }

    return(
        <>
            <div className="backgroundImage">
                <img src="/images/backgroundNTI.jpg"/>
            </div>
        
            <img id="logo" src="images/nti_logo_footer.svg" alt=""/>
            <div className="grid-center">
                <div className="message-container-wrapper">
                    <div className="login-container">
                        <h1>Logga In</h1>
                        <div className="password">
                            <input type="password" id="password" name='password' onChange={updateState} placeholder="Lösenord"/><br/>
                            <div className="incorrect-password">
                                <img src="/images/danger.svg" alt="picture of eye"/>
                                <span>Fel lösenord</span>
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
    
    