import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import './home.css';
import { auth } from './firebase'; // Importeer de auth-instantie van Firebase

const Home = () => {
  const navigate = useNavigate();

  const generateGameId = () => {
    return Math.floor(Math.random() * 10000).toString();
  };

  const addGameIdToCheckpoints = async (db, gameId) => {
    try {
      await addDoc(collection(db, 'checkpoints'), { gameId });
    } catch (error) {
      console.error('Fout bij het toevoegen van gameId aan checkpoints:', error);
    }
  };

  const handleNewGame = async () => {
    const gameId = generateGameId(); // Genereer gameId

    try {
      const db = getFirestore();

      // Voeg gameId toe aan de games-collectie
      const gameRef = await addDoc(collection(db, 'games'), { gameId });

      // Voeg gameId toe aan de checkpoints-collectie
      await addGameIdToCheckpoints(db, gameId);

      const user = auth.currentUser; // Haal de huidige gebruiker op
      if (user) { // Controleer of de gebruiker is ingelogd
        const email = user.email; // Haal de e-mail van de gebruiker op
        
        // Voeg de gebruiker toe aan de players-collectie als host
        await addDoc(collection(db, 'players'), { email, gameId, role: 'host' });
      } else {
        console.error('Gebruiker is niet ingelogd.');
        // Voeg hier eventueel een foutmelding toe voor de gebruiker
      }

      navigate(`/newGame/${gameId}`);
    } catch (error) {
      console.error('Fout bij het maken van het spel:', error);
      // Voeg hier eventueel een foutmelding toe voor de gebruiker
    }
  };

  const handleJoinGame = () => {
    navigate('/participateGame');
  };

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

export default Home;
