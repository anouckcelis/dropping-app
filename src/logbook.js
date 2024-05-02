import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { FaArrowLeft } from 'react-icons/fa';
import './logbook.css';

const Logbook = ({ gameId }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const firestore = getFirestore();

        // Query om spelers op te halen op basis van gameId
        const playersQuery = query(collection(firestore, 'players'), where('gameId', '==', gameId));

        const playerSnapshot = await getDocs(playersQuery);
        const playersData = playerSnapshot.docs.map(doc => doc.data());

        // Filter de spelers op basis van de rol (player) voordat we ze in de state zetten
        const filteredPlayers = playersData.filter(player => player.role === 'player');

        // Set de spelers in de state
        setPlayers(filteredPlayers);
        
        setLoading(false);
      } catch (error) {
        setError('Fout bij het ophalen van gegevens uit Firestore: ' + error.message);
        setLoading(false);
      }
    };
  
    fetchPlayers();
  }, [gameId]);
  
  const handleBackToLastPage = () => {
    window.history.back();
  };

  return (
    <div className="logbook-container">
      <h1>Logboek</h1>
      
      <h3>Informatie over het spel en de deelnemers</h3>
    
      {loading ? (
        <p>Laden...</p>
      ) : players.length > 0 ? (
        <ul className="item-wrapper">
          {players.map((player, index) => (
            <li key={index} className="item">
              <span className="item__position">{player.email}</span>
              <span>Totaal aantal punten gescand: {player.points || 0}</span>
              <span>Aantal keer gecatcht: {player.catches || 0}</span>
              <span>Tijd: {player.time || 'N/A'}</span>
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

export default Logbook;

