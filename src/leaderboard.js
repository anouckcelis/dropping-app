import React, { useState, useEffect } from 'react';
import './leaderboard.css';
import { FaArrowLeft } from 'react-icons/fa';
import data from './data.json'; // Importeer de statische gegevens

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    // Sorteer de spelers op basis van hun prestaties (bijvoorbeeld scores)
    const sortedData = [...data].sort((a, b) => b.score - a.score);
    setLeaderboardData(sortedData);
  }, []); // Zorg ervoor dat deze useEffect alleen wordt uitgevoerd bij het laden van de component

  const handleBackToLastPage = () => {
    window.history.back();
  };

  return (
    <div className="leaderboard-container">
      <h1>Ranking</h1>
      <ul className="item-wrapper">
        {leaderboardData.map((row, index) => (
          <li className="item" key={row.userID}>
            <span className="item__position">{index + 1}</span>
            <span className="item__name">{row.displayEmail}</span>
          </li>
        ))}
      </ul>
      <div className="back-button-container">
        <button className="back-button" onClick={handleBackToLastPage}><FaArrowLeft /></button>
      </div>
    </div>
  );
}

export default Leaderboard;