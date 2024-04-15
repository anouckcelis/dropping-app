import React from 'react';
import Navigatie from './components/navigatie/navigatie.js';
import './home.css';

const Home = () => {
  return (
    <div className="dashboard-container">
      <h1>Hallo!</h1>
      <strong>Welkom in de app!</strong>
      <p>Vooraleer we kunnen starten, hier even een korte uitleg.</p>
      <h4>Wat is een dropping juist?</h4>
      <p>Een spel waarbij personen geblinddoekt naar een plek worden gebracht, vanwaar zij zelfstandig de weg terug moeten vinden.</p>
      <h4>Wat is de bedoeling van deze app?</h4>
      <p>
        Binnen deze app zit een kaart en een QR-code-scanner. Dit is om het spel te vergemakkelijken.
        Op de map kan de live-locatie gezien worden van elke gebruiker, waardoor de begeleider makkelijk weet waar iedereen zich bevind.
        De QR-code-scanner kan gebruikt worden om op bepaalde plaatsen QR-codes te scannen waarop opdrachten staan die uitgevoerd moeten worden.
      </p>
      <Navigatie />
    </div>
  );
};

export default Home;
