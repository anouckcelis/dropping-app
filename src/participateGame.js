import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import NavigatiePlayer from '../src/components/navigatie/navigatiePlayer/navigatiePlayer';
import './participateGame.css';
import { auth, firestore } from './firebase'; // Importeer de auth-instantie en firestore-instantie van Firebase

const ParticipateGame = () => {
  const [gameId, setGameId] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isHostSelected, setIsHostSelected] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore(); // Haal Firestore-instantie op

  const startGame = async () => {
    // Zoek de gameId op in de database
    const gameQuery = query(collection(db, 'games'), where('gameId', '==', gameId));
    const querySnapshot = await getDocs(gameQuery);

    if (!querySnapshot.empty) { // Als er een gameId is gevonden
      const user = auth.currentUser; // Haal de huidige gebruiker op
      if (user) { // Controleer of de gebruiker is ingelogd
        const email = user.email; // Haal de e-mail van de gebruiker op
        // Voeg de gebruiker toe aan de players-collectie met hun e-mail
        await addDoc(collection(db, 'players'), { email, gameId });
        setIsGameStarted(true); // Zet isGameStarted op true
      } else {
        console.error('Gebruiker is niet ingelogd.');
        // Voeg hier eventueel een foutmelding toe voor de gebruiker
      }
    } else {
      console.error('GameId niet gevonden.');
      // Voeg hier eventueel een foutmelding toe voor de gebruiker
    }
  };

  const handleBecomeHost = () => {
    // Stuur de gebruiker door naar de hostpagina met de gameId
    navigate(`/newGame/${gameId}`);
  };

  return (
    <div className="participateGame-container">
      <h1>Het spel</h1>
      <h3>Je bent een Player in dit spel</h3>
      <p>
        De player in het spel speelt het spel. Deze gaat op stap en volgt een route van een startpunt tot een eindpunt. 
        Tussendoor kom je checkpoints tegen daar is het de bedoeling dat je de qr-codes scant en deze zo snel mogelijk voorbij gaat en zo tot het eindpunt komt.
        Wie als eerste de qr-code bij het eindpunt scant, WINT!
      </p>

      {!isGameStarted && (
        <div className="inputContainer">
          <input 
            className="inputBoxGameId" 
            type="text" 
            placeholder="GameId" 
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          />
          <button className='buttonGo' onClick={startGame}>Ga naar spel</button>
          <NavigatiePlayer gameId={gameId} /> {/* Toon NavigatiePlayer-component samen met het invoerformulier */}
        </div>
      )}

      {isGameStarted && (
        <div>
          <p>Je kunt nu deelnemen aan het spel.</p>
          <br/>
          <h3> GameId: </h3>
          <h2>{gameId}</h2>
          {!isHostSelected && ( // Toon de knop "Ik wil ook host zijn" als de gebruiker nog niet heeft gekozen om host te zijn
            <button className='buttonHost' onClick={handleBecomeHost}>Ik wil ook host zijn</button>
          )}
        </div>
      )}

      <NavigatiePlayer gameId={gameId} /> {/* Toon NavigatiePlayer-component nadat het spel is gestart */}
    </div>
  );
};

export default ParticipateGame;
