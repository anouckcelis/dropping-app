// Importeer React en de useState en useEffect hooks voor het beheren van component state en effecten
import React, { useState, useEffect } from 'react';

// Importeer de nodige Firestore functies voor interactie met de database
import { getFirestore, collection, query, getDocs, where } from 'firebase/firestore';

// Importeer de FaArrowLeft icon uit react-icons voor de back-to-last-page knop
import { FaArrowLeft } from 'react-icons/fa';

// Importeer de CSS-bestand voor stijlen
import './leaderboard.css';

import { useParams } from 'react-router-dom';

// Definieer de Leaderboard component
const Leaderboard = () => {
  // Gebruik useState om de leaderboardData en loading state te beheren
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { gameId } = useParams();

  // Gebruik useEffect om een effect te definiëren dat wordt uitgevoerd bij het mounten van de component
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // Initialiseer de Firestore database
        const firestore = getFirestore();

        // Maak een query om spelers op te halen op basis van gameId
        const playersQuery = query(collection(firestore, 'players'), where('gameId', '==', gameId));

        // Haal de spelers op
        const playerSnapshot = await getDocs(playersQuery);
        const playersData = playerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sorteer de spelers op basis van de criteria
        const sortedData = playersData
          .filter(player => player.role === 'player') // Alleen spelers (geen andere rollen)
          .sort((a, b) => {
            if (a.aantalGescandeCheckpoints !== b.aantalGescandeCheckpoints) {
              return a.aantalGescandeCheckpoints - b.aantalGescandeCheckpoints;
            }
            return a.aantalKeerGecatcht - b.aantalKeerGecatcht;
          });

        // Set de gesorteerde data in de state
        setLeaderboardData(sortedData);
        setLoading(false);
      } catch (error) {
        setError('Fout bij het ophalen van gegevens uit Firestore: ' + error.message);
        setLoading(false);
      }
    };

    // Roep de fetchLeaderboardData functie aan
    fetchLeaderboardData();
  }, [gameId]); // Het effect wordt uitgevoerd bij het mounten van de component en bij wijziging van gameId

  // Definieer de handleBackToLastPage functie die wordt aangeroepen om terug te gaan naar de vorige pagina
  const handleBackToLastPage = () => {
    window.history.back();
  };

  // Render de component
  return (
    <div className="leaderboard-container">
      <h1>Ranking</h1>
      {loading ? (
        <p>Laden...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <ul className="item-wrapper">
          {leaderboardData.map((row, index) => (
            <li className="item" key={row.id}>
              <span className="item__position">{index + 1}</span>
              <span className="item__name">{row.email}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="back-button-container">
        <button className="back-button" onClick={handleBackToLastPage}><FaArrowLeft /></button>
      </div>
    </div>
  );
}

// Exporteer de component zodat deze kan worden gebruikt in andere bestanden
export default Leaderboard;
