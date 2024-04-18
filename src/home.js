import React from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleNewGame = () => {
    const gameId = generateGameId();
    navigate(`/newGame/${gameId}`);
  };

  const handleJoinGame = () => {
    navigate('/participateGame');
  };

  const generateGameId = () => {
    return Math.floor(Math.random() * 10000).toString();
  };

  return (
    <div className="dashboard-container">
      <h1>Hallo!</h1>
      <strong>Welkom in de app!</strong>
      <p>Vooraleer we kunnen starten, hier even een korte uitleg.</p>
      <h4 className='tussentitels'>Wat is een guerilliadropping juist?</h4>
      <p>Een spel waarbij personen geblinddoekt naar een plek worden gebracht, vanwaar zij zelfstandig de weg terug moeten vinden. via checkpoint, maar pas op ze kunnen ook gecatcht worden en zo terug naar het begin worden gebracht.</p>
      <h4 className='tussentitels'>Wat is de bedoeling van deze app?</h4>
      <p>
        Er zijn hosts en players. Diegene die host zijn leiden het spel en zorgen voor de checkpoints, maar deze zullen ook achter de players aangaan om ze te kunnen catchen.
        De players moeten zo snel mogelijk via checkpoints het einde bereiken en dat door uit de handen te blijven van de hosts. Wanneer ze gecatcht worden beginnen ze terug bij start.
        Op de map kunnen ze zien waar ze naartoe moeten en met de QR-scanner kunnen ze hun points
      </p>
      <div>
        <button className='button' onClick={handleNewGame}>Nieuw spel</button>   
        <button className='button' onClick={handleJoinGame}>Deelnemen</button>   
      </div>
    </div>
  );
};

export default Home;
