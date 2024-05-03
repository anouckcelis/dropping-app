// Importeer React en de useState hook voor het beheren van component state
import React, { useState } from 'react';

// Importeer de useNavigate hook uit react-router-dom voor navigatie tussen pagina's
import { useNavigate } from 'react-router-dom';

// Importeer de nodige Firestore functies voor interactie met de database
import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

// Importeer de NavigatiePlayer component voor navigatie binnen het spel
import NavigatiePlayer from '../src/components/navigatie/navigatiePlayer/navigatiePlayer';

// Importeer de CSS-bestand voor stijlen
import './participateGame.css';

// Importeer de auth en firestore instanties uit het firebase configuratiebestand
import { auth, firestore } from './firebase';

// Definieer de ParticipateGame component
const ParticipateGame = () => {
  // Gebruik useState om de waarden van gameId, isGameStarted, isHostSelected, role, playerEmail, en errorMessage te beheren
  const [gameId, setGameId] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isHostSelected, setIsHostSelected] = useState(false);
  const [role, setRole] = useState('player');
  const [playerEmail, setPlayerEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Gebruik de useNavigate hook om een functie te krijgen die kan worden gebruikt om naar andere routes te navigeren
  const navigate = useNavigate();

  // Initialiseer de Firestore database
  const db = getFirestore();

  // Definieer de startGame functie die wordt aangeroepen om het spel te starten
  const startGame = async () => {
    // Maak een query om games te vinden met de meegegeven gameId
    const gameQuery = query(collection(db, 'games'), where('gameId', '==', gameId));
    const querySnapshot = await getDocs(gameQuery);

    // Controleer of er een game gevonden is
    if (!querySnapshot.empty) {
      // Haal de huidige gebruiker op
      const user = auth.currentUser;
      if (user) {
        // Voeg de gebruiker toe aan de players collectie
        const email = user.email;
        await addDoc(collection(db, 'players'), { email, gameId, role: 'player' });
        // Update de component state
        setIsGameStarted(true);
        setPlayerEmail(email);
      } else {
        console.error('Gebruiker is niet ingelogd.');
      }
    } else {
      setErrorMessage('GameId is fout.');
    }
  };

  // Definieer de handleBecomeHost functie die wordt aangeroepen om de gebruiker te laten hosten
  const handleBecomeHost = async () => {
    try {
      // Haal de huidige gebruiker op
      const user = auth.currentUser;
      if (user) {
        // Voeg de gebruiker toe aan de players collectie
        const email = user.email;
        const playerQuery = query(collection(db, 'players'), where('email', '==', email));
        const playerQuerySnapshot = await getDocs(playerQuery);
        if (!playerQuerySnapshot.empty) {
          // Update de rol van de gebruiker naar host
          const playerDocRef = playerQuerySnapshot.docs[0].ref;
          await updateDoc(playerDocRef, { role: 'host' });
          // Update de component state
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

  // Render de component
  return (
    <div className="participateGame-container">
      <h1>Het spel</h1>
      <h3>Je bent een Player in dit spel</h3>
      <p>
        De speler in het spel volgt een route van een startpunt tot een eindpunt.
        Tussendoor komt hij/zij checkpoints tegen waar hij/zij de QR-codes moet scannen en zo snel mogelijk voorbij moet gaan om tot het eindpunt te komen.
        Wie als eerste de QR-code bij het eindpunt scant, wint!
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
          <br />
          <h3>GameId:</h3>
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

// Exporteer de component zodat deze kan worden gebruikt in andere bestanden
export default ParticipateGame;


