import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import NavigatieHost from '../src/components/navigatie/navigatieHost/navigatieHost';
import './checkpoints.css';

const Checkpoints = () => {
  const { gameId } = useParams();
  const [checkpointName, setCheckpointName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [checkpoints, setCheckpoints] = useState([]);


  const handleAddCheckpoint = () => {
    if (checkpointName && longitude && latitude) {
      const newCheckpoint = {
        name: checkpointName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      };
      setCheckpoints([...checkpoints, newCheckpoint]);
      setCheckpointName(''); 
      setLatitude('');
      setLongitude('');
    }
  };

  const handleDeleteCheckpoint = (index) => {
    const updatedCheckpoints = [...checkpoints];
    updatedCheckpoints.splice(index, 1);
    setCheckpoints(updatedCheckpoints);
  };

  return (
    <div className="checkpoint-container">
      <h1>Checkpoints</h1>
      <h3>Voeg checkpoints toe</h3>
      <p>De eerste checkpoint die je toevoegt geef je de naam "Start" en de laatste "einde". De tussenliggende checkpoints kies je zelf!</p>
      <div className="inputContainer">
        <label>Checkpoint naam:</label>
        <input 
          className="inputBox" 
          type="text" 
          placeholder="Voer checkpoint naam in" 
          value={checkpointName}
          onChange={(e) => setCheckpointName(e.target.value)}
        />
        <label>Latitude:</label>
        <input 
          className="inputBox" 
          type="text" 
          placeholder="Voer latitude in" 
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
        />
        <label>Longitude:</label>
        <input 
          className="inputBox" 
          type="text" 
          placeholder="Voer longitude in" 
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
        />
      </div>
      <div>
        <button className='button' onClick={handleAddCheckpoint}>Toevoegen</button> 
      </div>
      <h2>Checkpoints Lijst</h2>
      <ul>
        {checkpoints.map((checkpoint, index) => (
          <li key={index}>
            {checkpoint.name}
            <button className='buttonX' onClick={() => handleDeleteCheckpoint(index)}>X</button>
          </li>
        ))}
      </ul>
      <NavigatieHost gameId={gameId} />
    </div>
  );
};

export default Checkpoints;
