import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import NavigatiePlayer from '../src/components/navigatie/navigatiePlayer/navigatiePlayer';
import './participateGame.css';
import { auth, firestore } from './firebase';

const ParticipateGame = () => {
  const [gameId, setGameId] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isHostSelected, setIsHostSelected] = useState(false);
  const [role, setRole] = useState('player');
  const [playerEmail, setPlayerEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const db = getFirestore();

  const startGame = async () => {
    const gameQuery = query(collection(db, 'games'), where('gameId', '==', gameId));
    const querySnapshot = await getDocs(gameQuery);

    if (!querySnapshot.empty) {
      const user = auth.currentUser;
      if (user) {
        const email = user.email;
        await addDoc(collection(db, 'players'), { email, gameId, role: 'player' });
        setIsGameStarted(true);
        setPlayerEmail(email);
      } else {
        console.error('Gebruiker is niet ingelogd.');
      }
    } else {
      setErrorMessage('GameId is fout.');
    }
  };

  const handleBecomeHost = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const email = user.email;
        const playerQuery = query(collection(db, 'players'), where('email', '==', email));
        const playerQuerySnapshot = await getDocs(playerQuery);
        if (!playerQuerySnapshot.empty) {
          const playerDocRef = playerQuerySnapshot.docs[0].ref; // Haal de referentie naar het document op
          await updateDoc(playerDocRef, { role: 'host' });
          setRole('host');
          setIsHostSelected(true);
          navigate(`/newGame/${gameId}`);
        } else {
          console.error('Spelerdocument niet gevonden.');
        }
      } else {
        console.error('Gebruiker is niet ingelogd.');
      }
    } catch (error) {
      console.error('Fout bij het updaten van de rol:', error);
    }
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
          <NavigatiePlayer gameId={gameId} />
        </div>
      )}

      {isGameStarted && (
        <div>
          <p>Je kunt nu deelnemen aan het spel.</p>
          <br/>
          <h3> GameId: </h3>
          <h2>{gameId}</h2>
          {!isHostSelected && (
            <button className='buttonHost' onClick={handleBecomeHost}>Ik wil ook host zijn</button>
          )}
        </div>
      )}

      {errorMessage && <p>{errorMessage}</p>}

      <NavigatiePlayer gameId={gameId} />
    </div>
  );
};

export default ParticipateGame;
