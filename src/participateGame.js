import React, { useState } from 'react';
import NavigatiePlayer from '../src/components/navigatie/navigatiePlayer/navigatiePlayer';
import './participateGame.css';

const ParticipateGame = () => {
  const [gameId, setGameId] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);

  const startGame = () => {
    setIsGameStarted(true);
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
            className="inputBox" 
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
             
        </div>
         
      )}
      <NavigatiePlayer gameId={gameId} /> {/* Toon NavigatiePlayer-component nadat het spel is gestart */}
    </div>
  );
};

export default ParticipateGame;
