// Importeer de React bibliotheek
import React from "react";

// Importeer de useNavigate hook uit react-router-dom voor navigatie tussen pagina's
import { useNavigate } from "react-router-dom";

// Importeer het logo afbeelding
import logo from './images/logospotgroup.png';

// Importeer de bijbehorende CSS-bestand voor stijlen
import "./start.css";

// Definieer de Start component
const Start = (props) => {
    // Destructure de props om directe toegang te krijgen tot loggedIn en email
    const { loggedIn, email } = props;

    // Gebruik de useNavigate hook om een functie te krijgen die kan worden gebruikt om naar andere routes te navigeren
    const navigate = useNavigate();

    // Definieer de handleButtonClick functie die wordt aangeroepen wanneer de button wordt geklikt
    const handleButtonClick = () => {
        // Controleer of de gebruiker ingelogd is
        if (loggedIn) {
            // Verwijder de gebruiker uit de lokale opslag
            localStorage.removeItem("user");
            // Update de loggedIn status via props
            props.setLoggedIn(false);
        } else {
            // Navigeer naar de login pagina als de gebruiker niet ingelogd is
            navigate("/login");
        }
    };

    // Render de component
    return (
        <div className="main">
            {/* Titel container */}
            <div className="titleCon">
                <div className="title">Welkom!</div>
            </div>
            {/* Informatie containers */}
            <div className="info">
               Wil je meedoen met de dropping?
            </div>
            <div className="info">
               Meld je dan aan!
            </div>
            <br />
            {/* Button container */}
            <div className="buttonCon">
                {/* Log in / Log out button */}
                <input
                    className="inputButton"
                    type="button"
                    onClick={handleButtonClick}
                    value={loggedIn? "Log out" : "Log in"}
                />
                {/* Toon de e-mailadres van de ingelogde gebruiker */}
                {loggedIn && <div className="email">Your email address is {email}</div>}
            </div>
            {/* Logo container */}
            <div className="logo">
                {/* Link naar de SpotGroup website */}
                <a href="https://spotgroup.be/">
                    {/* Toon het logo */}
                    <img src={logo} alt="logo SpotGroup" />
                </a>  
            </div>     
        </div>
    );
};

// Exporteer de component zodat deze kan worden gebruikt in andere bestanden
export default Start;
