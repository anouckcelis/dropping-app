import { NavLink, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useState } from "react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate(); // Hook voor navigatie

  // instantiate the auth service SDK
  const auth = getAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  // Handle user sign up with email and password
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Pull out user's data from the userCredential property
      const user = userCredential.user;
      // Navigeer terug naar de inlogpagina na succesvol registreren
      navigate('/login');
    } catch (err) {
      // Handle errors here
      const errorMessage = err.message;
      const errorCode = err.code;

      setError(true);

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

export default Register;
