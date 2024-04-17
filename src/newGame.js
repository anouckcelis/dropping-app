import React from 'react';
import { useParams } from 'react-router-dom';
import Navigatie from '../src/components/navigatie/navigatie'
import './newGame.css';

const NewGame = () => {
  const { gameId } = useParams();

  return (
    <div className="newGame-container">
      <h1>Het spel</h1>
      <h2>Game ID: {gameId}</h2>
      <h3>Je bent een host van dit spel</h3>
      <p>
      De host in een spel heeft de controle en fungeert als jager, terwijl ze checkpoints instellen en de spelers volgen.
      </p>
      <div>
        <button className='button'>Stel checkpoints in</button> 
      </div>
      <Navigatie />
    </div>
  );
};

export default NewGame;
