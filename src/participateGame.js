import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import NavigatiePlayer from '../src/components/navigatie/navigatiePlayer/navigatiePlayer';
import './participateGame.css';
import { auth, firestore } from './firebase';

const ParticipateGame = () => {
  // Staat voor het spel
  const [gameId, setGameId] = useState(''); // gameId van het spel
  const [isGameStarted, setIsGameStarted] = useState(false); // Controleert of het spel is gestart
  const [isHostSelected, setIsHostSelected] = useState(false); // Controleert of de host is geselecteerd
  const [role, setRole] = useState('player'); // Rol van de speler (standaard: player)
  const [playerEmail, setPlayerEmail] = useState(''); // E-mailadres van de speler
  const [errorMessage, setErrorMessage] = useState(''); // Foutbericht weergeven
  const navigate = useNavigate(); // Navigatiehaak gebruiken om door de app te navigeren
  const db = getFirestore(); // Firestore-instantie verkrijgen

  // Functie om het spel te starten
  const startGame = async () => {
    const gameQuery = query(collection(db, 'games'), where('gameId', '==', gameId)); // Query om gameId te vinden in de database
    const querySnapshot = await getDocs(gameQuery); // Snapshot van de query ophalen

    if (!querySnapshot.empty) { // Controleren of de query resultaten bevat
      const user = auth.currentUser; // Huidige gebruiker ophalen
      if (user) { // Controleren of de gebruiker is ingelogd
        const email = user.email; // E-mailadres van de gebruiker
        await addDoc(collection(db, 'players'), { email, gameId, role: 'player' }); // Speler toevoegen aan de database
        setIsGameStarted(true); // Het spel is gestart
        setPlayerEmail(email); // E-mailadres van de speler instellen
      } else {
        console.error('Gebruiker is niet ingelogd.'); // Foutmelding als de gebruiker niet is ingelogd
      }
    } else {
      setErrorMessage('GameId is fout.'); // Foutmelding als gameId niet gevonden wordt
    }
  };

  // Functie om host te worden
  const handleBecomeHost = async () => {
    try {
      const user = auth.currentUser; // Huidige gebruiker ophalen
      if (user) { // Controleren of de gebruiker is ingelogd
        const email = user.email; // E-mailadres van de gebruiker
        const playerQuery = query(collection(db, 'players'), where('email', '==', email)); // Query om speler te vinden in de database
        const playerQuerySnapshot = await getDocs(playerQuery); // Snapshot van de query ophalen
        if (!playerQuerySnapshot.empty) { // Controleren of de query resultaten bevat
          const playerDocRef = playerQuerySnapshot.docs[0].ref; // Documentreferentie van de speler
          await updateDoc(playerDocRef, { role: 'host' }); // Rol van de speler bijwerken naar host
          setRole('host'); // Rol instellen als host
          setIsHostSelected(true); // Host is geselecteerd
          navigate(`/newGame/${gameId}`); // Navigeren naar de nieuwe game pagina met gameId
        } else {
          console.error('Spelerdocument niet gevonden.'); // Foutmelding als het spelerdocument niet wordt gevonden
        }
      } else {
        console.error('Gebruiker is niet ingelogd.'); // Foutmelding als de gebruiker niet is ingelogd
      }
    } catch (error) {
      console.error('Fout bij het updaten van de rol:', error); // Foutmelding bij het updaten van de rol
    }
  };

  // JSX retourneren voor de ParticipateGame-component
  return (
    <div className="participateGame-container">
      <h1>Het spel</h1>
      <h3>Je bent een Player in dit spel</h3>
      <p>
        De speler in het spel volgt een route van een startpunt tot een eindpunt.
        Tussendoor komt hij/zij checkpoints tegen waar hij/zij de QR-codes moet scannen en zo snel mogelijk voorbij moet gaan om tot het eindpunt te komen.
        Wie als eerste de QR-code bij het eindpunt scant, wint!
      </p>

      {/* Weergave van invoerformulier als het spel niet is gestart */}
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
          <NavigatiePlayer gameId={gameId} /> {/* NavigatiePlayer-component samen met het invoerformulier */}
        </div>
      )}

      {/* Weergave van deelnameopties als het spel is gestart */}
      {isGameStarted && (
        <div>
          <p>Je kunt nu deelnemen aan het spel.</p>
          <br />
          <h3>GameId:</h3>
          <h2>{gameId}</h2>
          {/* Knop "Ik wil ook host zijn" wordt weergegeven als de speler nog geen host is */}
          {!isHostSelected && (
            <button className='buttonHost' onClick={handleBecomeHost}>Ik wil ook host zijn</button>
          )}
        </div>
      )}

      {/* Foutmelding wordt weergegeven als er een fout optreedt */}
      {errorMessage && <p>{errorMessage}</p>}

      <NavigatiePlayer gameId={gameId} /> {/* NavigatiePlayer-component */}
    </div>
  );
};

export default ParticipateGame;
