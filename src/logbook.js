// Importeer React en de useState en useEffect hooks voor het beheren van component state en effecten
import React, { useState, useEffect } from 'react';

// Importeer de nodige Firestore functies voor interactie met de database
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Importeer de FaArrowLeft icon uit react-icons voor de back-to-last-page knop
import { FaArrowLeft } from 'react-icons/fa';

// Importeer de CSS-bestand voor stijlen
import './logbook.css';

import { useParams } from 'react-router-dom';

// Definieer de Logbook component met een gameId prop
const Logbook = () => {
  // Gebruik useState om de waarden van players, loading, en error te beheren
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { gameId } = useParams();

  // Gebruik useEffect om een effect te definiëren dat wordt uitgevoerd bij het mounten van de component en bij wijziging van gameId
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        // Initialiseer de Firestore database
        const firestore = getFirestore();

        // Maak een query om spelers op te halen op basis van gameId
        const playersQuery = query(collection(firestore, 'players'), where('gameId', '==', gameId));

        // Haal de spelers op
        const playerSnapshot = await getDocs(playersQuery);
        const playersData = playerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter de spelers op basis van de rol (player) voordat we ze in de state zetten
        const filteredPlayers = playersData.filter(player => player.role === 'player');

        // Set de spelers in de state
        setPlayers(filteredPlayers);

        // Zet loading naar false
        setLoading(false);
      } catch (error) {
        // Set de foutmelding in de state
        setError('Fout bij het ophalen van gegevens uit Firestore: ' + error.message);
        // Zet loading naar false
        setLoading(false);
      }
    };

    // Roep de fetchPlayers functie aan
    fetchPlayers();
  }, [gameId]); // Het effect wordt uitgevoerd bij het mounten van de component en bij wijziging van gameId
  
  // Definieer de handleBackToLastPage functie die wordt aangeroepen om terug te gaan naar de vorige pagina
  const handleBackToLastPage = () => {
    window.history.back();
  };

  // Render de component
  return (
    <div className="logbook-container">
      <h1>Logboek</h1>
      
      <h3>Informatie over het spel en de deelnemers</h3>
    
      {loading ? (
        <p>Laden...</p>
      ) : error ? (
        <p>{error}</p>
      ) : players.length > 0 ? (
        <ul className="item-wrapper">
          {players.map((player, index) => (
            <li key={index} className="item">
              <span className="item__position">{player.email}</span>
              <li>Totaal aantal punten gescand: <strong className='color'>{player.aantalGescandeCheckpoints || 0}</strong></li>
              <li>Aantal keer gecatcht: <strong className='color'>{player.aantalKeerGecatcht || 0}</strong></li>
              <li>Tijd: <strong className='color'>{player.timestamp ? new Date(player.timestamp.seconds * 1000).toLocaleString() : 'Geen tijd beschikbaar'}</strong></li>
            </li>
          ))}
        </ul>
      ) : (
        <p>Er zijn geen spelers binnen dit spel.</p>
      )}

      <div className="back-button-container">
        <button className="back-button" onClick={handleBackToLastPage}><FaArrowLeft /></button>
      </div>
    </div>
  );
};

// Exporteer de component zodat deze kan worden gebruikt in andere bestanden
export default Logbook;

