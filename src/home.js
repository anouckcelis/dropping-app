// Importeer React voor het bouwen van de component
import React from 'react';

// Importeer de useNavigate hook uit react-router-dom voor navigatie tussen pagina's
import { useNavigate } from 'react-router-dom';

// Importeer de nodige Firestore functies voor interactie met de database
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Importeer de auth instantie uit het firebase configuratiebestand
import { auth } from './firebase';

// Importeer de CSS-bestand voor stijlen
import './home.css';

// Definieer de Home component
const Home = () => {
  // Gebruik de useNavigate hook om een functie te krijgen die kan worden gebruikt om naar andere routes te navigeren
  const navigate = useNavigate();

  // Definieer de generateGameId functie die een willekeurige gameId genereert
  const generateGameId = () => {
    return Math.floor(Math.random() * 10000).toString();
  };

  // Definieer de handleNewGame functie die wordt aangeroepen om een nieuw spel te creëren
  const handleNewGame = async () => {
    const gameId = generateGameId();

    try {
      // Initialiseer de Firestore database
      const db = getFirestore();

      // Voeg een nieuwe game toe aan de 'games' collectie
      const gameRef = await addDoc(collection(db, 'games'), { gameId });

      // Haal de huidige gebruiker op
      const user = auth.currentUser;
      if (user) {
        // Voeg de gebruiker toe aan de 'players' collectie met de rol 'host'
        const email = user.email;
        await addDoc(collection(db, 'players'), { email, gameId, role: 'host' });
      } else {
        console.error('Gebruiker is niet ingelogd.');
      }

      // Navigeer naar de nieuwe game pagina
      navigate(`/newGame/${gameId}`);
    } catch (error) {
      console.error('Fout bij het maken van het spel:', error);
    }
  };

  // Definieer de handleJoinGame functie die wordt aangeroepen om deelneming aan een spel te starten
  const handleJoinGame = () => {
    navigate('/participateGame');
  };

  // Render de component
  return (
    <div className="dashboard-container">
      <h1>Hallo!</h1>
      <strong>Welkom in de app!</strong>
      <p>Vooraleer we kunnen starten, hier even een korte uitleg.</p>
      <h4 className='tussentitels'>Wat is een guerilliadropping juist?</h4>
      <p>Een spel waarbij personen geblinddoekt naar een plek worden gebracht, vanwaar zij zelfstandig de weg terug moeten vinden. via checkpoint, maar pas op ze kunnen ook gecatcht worden en zo terug naar het begin worden gebracht.</p>
      <h4 className='tussentitels'>Wat is de bedoeling van deze app?</h4>
      <p>
        Er zijn hosts en players. Diegene die host zijn leiden het spel en zorgen voor de checkpoints, maar deze zullen ook achter de players aangaan om ze te kunnen catchen.
        De players moeten zo snel mogelijk via checkpoints het einde bereiken en dat door uit de handen te blijven van de hosts. Wanneer ze gecatcht worden beginnen ze terug bij start.
        Op de map kunnen ze zien waar ze naartoe moeten en met de QR-scanner kunnen ze hun points
      </p>
      <div>
        <button className='button' onClick={handleNewGame}>Nieuw spel</button>   
        <button className='button' onClick={handleJoinGame}>Deelnemen</button>   
      </div>
    </div>
  );
};

// Exporteer de component zodat deze kan worden gebruikt in andere bestanden
export default Home;

