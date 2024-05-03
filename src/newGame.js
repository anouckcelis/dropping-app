// Importeer React voor het bouwen van de component
import React from 'react';

// Importeer de useParams hook uit react-router-dom voor het ophalen van parameters uit de URL
import { useParams } from 'react-router-dom';

// Importeer de NavigatieHost component voor navigatie binnen het spel
import NavigatieHost from '../src/components/navigatie/navigatieHost/navigatieHost'; 

// Importeer de CSS-bestand voor stijlen
import './newGame.css';

// Importeer de useNavigate hook uit react-router-dom voor navigatie tussen pagina's
import { useNavigate } from 'react-router-dom';

// Definieer de NewGame component
const NewGame = () => {
  // Gebruik useParams om de gameId parameter uit de URL op te halen
  const { gameId } = useParams();

  // Gebruik de useNavigate hook om een functie te krijgen die kan worden gebruikt om naar andere routes te navigeren
  const navigate = useNavigate();
  
  // Definieer de handleGoToCheckpoints functie die wordt aangeroepen om naar de checkpoints pagina te navigeren
  const handleGoToCheckpoints = () => {
    navigate(`/checkpoints/${gameId}`);
  };

  // Render de component
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
      <NavigatieHost gameId={gameId} />
    </div>
  );
};

// Exporteer de component zodat deze kan worden gebruikt in andere bestanden
export default NewGame;
