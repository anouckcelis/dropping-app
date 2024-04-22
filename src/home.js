import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import './home.css';
import { auth } from './firebase'; // Importeer de auth-instantie van Firebase

const Home = () => {
  const navigate = useNavigate(); // Navigatiehaak gebruiken om door de app te navigeren

  // Functie om een willekeurige gameId te genereren
  const generateGameId = () => {
    return Math.floor(Math.random() * 10000).toString();
  };

  // Functie om gameId toe te voegen aan checkpoints in de database
  const addGameIdToCheckpoints = async (db, gameId) => {
    try {
      await addDoc(collection(db, 'checkpoints'), { gameId });
    } catch (error) {
      console.error('Fout bij het toevoegen van gameId aan checkpoints:', error);
    }
  };

  // Functie om een nieuw spel te maken
  const handleNewGame = async () => {
    const gameId = generateGameId(); // Genereer gameId

    try {
      const db = getFirestore(); // Firestore-instantie verkrijgen

      const gameRef = await addDoc(collection(db, 'games'), { gameId }); // Spel toevoegen aan de database

      await addGameIdToCheckpoints(db, gameId); // gameId toevoegen aan checkpoints

      const user = auth.currentUser; // Huidige gebruiker ophalen
      if (user) { // Controleren of de gebruiker is ingelogd
        const email = user.email; // E-mailadres van de gebruiker

        // Speler toevoegen aan de database met rol 'host'
        await addDoc(collection(db, 'players'), { email, gameId, role: 'host' });
      } else {
        console.error('Gebruiker is niet ingelogd.'); // Foutmelding als de gebruiker niet is ingelogd
      }

      navigate(`/newGame/${gameId}`); // Navigeren naar de nieuwe gamepagina met gameId
    } catch (error) {
      console.error('Fout bij het maken van het spel:', error); // Foutmelding bij het maken van het spel
    }
  };

  // Functie om aan een spel deel te nemen
  const handleJoinGame = () => {
    navigate('/participateGame'); // Navigeren naar de pagina om aan een spel deel te nemen
  };

  // JSX retourneren voor de Home-component
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
      {/* Knoppen voor het maken van een nieuw spel en het deelnemen aan een spel */}
      <div>
        <button className='button' onClick={handleNewGame}>Nieuw spel</button>   
        <button className='button' onClick={handleJoinGame}>Deelnemen</button>   
      </div>
    </div>
  );
};

export default Home;

