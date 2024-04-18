import React from 'react';
import { useParams } from 'react-router-dom';
import NavigatieHost from '../src/components/navigatie/navigatieHost/navigatieHost'; // Importeer de NavigatieHost-component
import './newGame.css';
import { useNavigate } from 'react-router-dom';

const NewGame = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  
  const handleGoToCheckpoints = () => {
    navigate('/checkpoints');
  };

  return (
    <div className="newGame-container">
      <h1>Het spel</h1>
      <h2>Spelcode: {gameId}</h2>
      <h3>Je bent een host in dit spel</h3>
      <p>
        De host in een spel heeft de controle en fungeert als jager, terwijl ze checkpoints instellen en de spelers volgen.
      </p>
      <div>
        <button className='buttonGo' onClick={handleGoToCheckpoints}>Stel checkpoints in</button> 
      </div>
      <NavigatieHost gameId={gameId} /> {/* Gebruik NavigatieHost-component met gameId */}
    </div>
  );
};

export default NewGame;

