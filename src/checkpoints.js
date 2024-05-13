import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavigatieHost from '../src/components/navigatie/navigatieHost/navigatieHost';
import { getFirestore, collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import './checkpoints.css';

const Checkpoints = () => {
  const { gameId } = useParams();
  const [checkpointName, setCheckpointName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [checkpoints, setCheckpoints] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const loadCheckpoints = async () => {
      try {
        const checkpointRef = doc(db, 'checkpoints', gameId);
        const checkpointDoc = await getDoc(checkpointRef);
        if (checkpointDoc.exists()) {
          const data = checkpointDoc.data();
          setCheckpoints(data.checkpoints || []);
        }
      } catch (error) {
        console.error('Fout bij het laden van checkpoints:', error);
      }
    };
    loadCheckpoints();
  }, [db, gameId]);

  const handleAddCheckpoint = async () => {
    if (checkpointName && latitude && longitude) {
      const newCheckpoint = {
        name: checkpointName,
        lat: parseFloat(latitude),
        lng: parseFloat(longitude)
      };

      try {
        const checkpointRef = collection(db, 'checkpoints');
        const docRef = await addDoc(checkpointRef, { gameId, ...newCheckpoint });
        const checkpointWithId = { id: docRef.id, ...newCheckpoint };
        setCheckpoints([...checkpoints, checkpointWithId]);
        
        // Log de toegevoegde checkpoint met id in de console
        console.log('Toegevoegde checkpoint:', checkpointWithId);
      } catch (error) {
        console.error('Fout bij het toevoegen van het checkpoint:', error);
      }

      setCheckpointName('');
      setLatitude('');
      setLongitude('');
    }
  };
  
  const handleDeleteCheckpoint = async (id, index) => {
    const updatedCheckpoints = [...checkpoints];
    updatedCheckpoints.splice(index, 1);
    setCheckpoints(updatedCheckpoints);

    try {
      await updateDoc(doc(db, 'checkpoints', gameId), { checkpoints: updatedCheckpoints });
    } catch (error) {
      console.error('Fout bij het bijwerken van checkpoints na verwijdering:', error);
    }
  };

  return (
    <div className="checkpoint-container">
      <h1>Checkpoints</h1>
      <h3>Voeg checkpoints toe</h3>
      <p>Voeg checkpoints toe aan het spel. De eerste checkpoint die je toevoegt, kan een startpunt zijn.</p>
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
            <button className='buttonX' onClick={() => handleDeleteCheckpoint(checkpoint.id, index)}>X</button>
          </li>
        ))}
      </ul>
      <NavigatieHost gameId={gameId} />
    </div>
  );
};

export default Checkpoints;
