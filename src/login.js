import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { NavLink, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // Stukje state om foutmeldingen op te slaan

    const onLogin = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                navigate("/home");
                console.log(user);
            })
            .catch((error) => {
                // Aangepast foutbericht
                setError("Mailadres of wachtwoord is verkeerd!");
                console.error(error);
            });
    }

    return (
        <>
            <div className={"mainContainer"}>
                <div className={"titleContainer"}>
                    <div className={"title"}>Login</div>
                </div>
                <br />
                <div className={"inputContainer"}>
                    <input
                        value={email}
                        placeholder="Vul hier je mailadres in"
                        onChange={(ev) => setEmail(ev.target.value)}
                        className={"inputBox"}
                    />
                </div>
                <br />
                <div className={"inputContainer"}>
                    <input
                        type="password"
                        value={password}
                        placeholder="Vul hier je wachtwoord in"
                        onChange={(ev) => setPassword(ev.target.value)}
                        className={"inputBox"}
                    />
                </div>
                <br />
                <div className={"inputContainer"}>
                    <input
                        className={"inputButton"}
                        type="button"
                        onClick={onLogin}
                        value={"Log in"}
                    />
                </div>
                <br/>
                <br/>
                {/* Toon de foutmelding als deze is ingesteld */}
                {error && <p className="text-sm text-center" style={{color: "red"}}>{error}</p>}
                <p className="text-sm text-white text-center">
                    Heb je nog geen account? <br /> {" "}
                    <NavLink to="/register" style={{ color: "#257eca" }}>Registreren</NavLink>
                </p>
            </div>
        </>
    )
}

export default Login; 