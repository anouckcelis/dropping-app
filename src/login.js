// Importeer React en de useState hook voor het beheren van component state
import React, { useState } from 'react';

// Importeer de signInWithEmailAndPassword functie uit firebase/auth voor het inloggen van gebruikers
import { signInWithEmailAndPassword } from 'firebase/auth';

// Importeer de auth instantie uit het firebase configuratiebestand
import { auth } from './firebase';

// Importeer de NavLink en useNavigate hooks uit react-router-dom voor navigatie en links binnen de applicatie
import { NavLink, useNavigate } from 'react-router-dom';

// Definieer de Login component
const Login = () => {
    // Gebruik useState om de waarden van email, password, en error te beheren
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // Stukje state om foutmeldingen op te slaan

    // Definieer de onLogin functie die wordt aangeroepen bij het indienen van het inlogformulier
    const onLogin = (e) => {
        e.preventDefault();
        // Probeer in te loggen met de meegegeven email en wachtwoord
        signInWithEmailAndPassword(auth, email, password)
           .then((userCredential) => {
                // Als succesvol ingelogd, navigeer naar de home pagina
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

    // Render de component
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

// Exporteer de component zodat deze kan worden gebruikt in andere bestanden
export default Login;
