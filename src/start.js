
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from './images/logospotgroup.png';
import "./start.css"; // Importeer de bijbehorende CSS-bestand

const Start = (props) => {
    const { loggedIn, email } = props;
    const navigate = useNavigate();
    
    const handleButtonClick = () => {
        if (loggedIn) {
            localStorage.removeItem("user");
            props.setLoggedIn(false);
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="main">
            <div className="titleCon">
                <div className="title">Welkom!</div>
            </div>
            <div className="info">
               Wil je meedoen met de dropping?
            </div>
            <div className="info">
               Meld je dan aan!
            </div>
            <br />
            <div className="buttonCon">
                <input
                    className="inputButton"
                    type="button"
                    onClick={handleButtonClick}
                    value={loggedIn ? "Log out" : "Log in"}
                />
                {loggedIn && <div className="email">Your email address is {email}</div>}
            </div>
            <div className="logo">
                <a href="https://spotgroup.be/">
                    <img src={logo} alt="logo SpotGroup" />
                </a>  
            </div>     
        </div>
    );
};

export default Start;
