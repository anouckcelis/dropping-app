// Importeer de NavLink en useNavigate hooks uit react-router-dom voor navigatie en links binnen de applicatie
import { NavLink, useNavigate } from "react-router-dom";

// Importeer de createUserWithEmailAndPassword en getAuth functies uit firebase/auth voor het registreren van gebruikers
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

// Importeer de useState hook uit React voor het beheren van component state
import { useState } from "react";

// Definieer de Register component
const Register = () => {
  // Gebruik useState om de waarden van email, password, error en errorMessage te beheren
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Gebruik de useNavigate hook om een functie te krijgen die kan worden gebruikt om naar andere routes te navigeren
  const navigate = useNavigate(); // Hook voor navigatie

  // Instantiateer de auth service SDK
  const auth = getAuth();

  // Definieer de handleChange functie die wordt aangeroepen bij elke verandering in de input velden
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update de state afhankelijk van het input veld dat is gewijzigd
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  // Definieer de handleSubmit functie die wordt aangeroepen bij het indienen van het formulier
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Probeer een nieuwe gebruiker aan te maken met email en wachtwoord
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Haal de gebruikersgegevens uit de userCredential eigenschap
      const user = userCredential.user;
      // Navigeer terug naar de inlogpagina na succesvol registreren
      navigate('/login');
    } catch (err) {
      // Behandel fouten hier
      const errorMessage = err.message;
      const errorCode = err.code;

      setError(true);

      // Set de foutmelding afhankelijk van het soort fout
      switch (errorCode) {
        case "auth/weak-password":
          setErrorMessage("Wachtwoord is te zwak.");
          break;
        case "auth/email-already-in-use":
          setErrorMessage(
            "Dit mailadres is al in gebruik bij een andere gebruiker."
          );
          break;
        case "auth/invalid-email":
          setErrorMessage("Ongeldig mailadres!");
          break;
        case "auth/operation-not-allowed":
          setErrorMessage(
            "Het is niet mogelijk om je te registreren met een e-mailadres en wachtwoord"
          );
          break;
        default:
          setErrorMessage(errorMessage);
          break;
      }
    }
  };

  // Render de component
  return (
    <>
      <div className={"mainContainer"}>
        <div className={"titleContainer"}>
          <div className={"title"}>Registreren</div>
        </div>
        <br />
        <form onSubmit={handleSubmit}>
          <div className={"inputContainer"}>
            <input
              type='email'
              placeholder='Vul hier je mailadres in'
              onChange={handleChange}
              name='email'
              value={email}
              className={"inputBox"}
            />
          </div>
          <br />
          <div className={"inputContainer"}>
            <input
              type="password"
              placeholder="Vul hier je wachtwoord in"
              onChange={handleChange}
              name='password'
              value={password}
              className={"inputBox"}
            />
          </div>
          <br />
          <div className={"inputContainer"} style={{ textAlign: "center" }}>
            <button
              className={"inputButton"}
              type="submit"
              style={{ margin: "0 auto" }}
            >
              Registreren
            </button>
            {error && <p className="text-center " style={{color: "red", alignContent:"center"}}>{errorMessage}</p>}
          </div>
        </form>
        <br/>
        <br/>
        <p className="text-sm text-center">
          Heb je al een account? <br/>{" "}
            <NavLink to="/login" style={{ color: "#257eca", alignContent:"center"}}>Log in</NavLink>
        </p>
      </div>
    </>
  );
};

// Exporteer de component zodat deze kan worden gebruikt in andere bestanden
export default Register;