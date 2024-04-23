import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavigatieHost from '../src/components/navigatie/navigatieHost/navigatieHost';
import { getFirestore, collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import './checkpoints.css';

/**
 * Component voor het beheren van checkpoints in een spel.
 * Maakt het toevoegen, weergeven en verwijderen van checkpoints mogelijk.
 */
const Checkpoints = () => {
  // Parameters uit de URL halen, zoals gameId
  const { gameId } = useParams();
  // Staat voor het bijhouden van de checkpointnaam, breedtegraad en lengtegraad
  const [checkpointName, setCheckpointName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  // Array voor het opslaan van checkpoints
  const [checkpoints, setCheckpoints] = useState([]);
  // Firestore database instantie ophalen
  const db = getFirestore();

  // Effect hook voor het laden van checkpoints bij het mounten van de component of wijziging in gameId
  useEffect(() => {
    const loadCheckpoints = async () => {
      try {
        // Referentie naar het document voor checkpoints
        const checkpointRef = doc(db, 'checkpoints', gameId);
        // Checkpoint document ophalen
        const checkpointDoc = await getDoc(checkpointRef);
        // Controleren of het document bestaat
        if (checkpointDoc.exists()) {
          const data = checkpointDoc.data();
          // Checkpoints instellen op basis van data uit Firestore, of een lege array als er geen data is
          setCheckpoints(data.checkpoints || []);
        }
      } catch (error) {
        console.error('Fout bij het laden van checkpoints:', error);
      }
    };
    // Functie uitvoeren wanneer db of gameId wijzigt
    loadCheckpoints();
  }, [db, gameId]);

  // Functie voor het toevoegen van een checkpoint aan de database
  const handleAddCheckpoint = async () => {
    // Controleren of alle vereiste velden zijn ingevuld
    if (checkpointName && latitude && longitude) {
      // Nieuw checkpoint object maken
      const newCheckpoint = {
        name: checkpointName,
        lat: parseFloat(latitude),
        lng: parseFloat(longitude)
      };

      try {
        // Nieuw checkpoint toevoegen aan Firestore database
        await addDoc(collection(db, 'checkpoints'), { gameId, ...newCheckpoint });
        // Nieuw checkpoint toevoegen aan lokale staat
        setCheckpoints([...checkpoints, newCheckpoint]);
      } catch (error) {
        console.error('Fout bij het toevoegen van het checkpoint:', error);
      }

      // Invoervelden resetten na toevoegen checkpoint
      setCheckpointName('');
      setLatitude('');
      setLongitude('');
    }
  };
 
  // Functie voor het verwijderen van een checkpoint uit de lijst en de database
  const handleDeleteCheckpoint = async (index) => {
    // Kopie maken van de huidige lijst met checkpoints
    const updatedCheckpoints = [...checkpoints];
    // Verwijder het checkpoint op de opgegeven index uit de kopie
    updatedCheckpoints.splice(index, 1);
    // Bijgewerkte lijst instellen als nieuwe staat
    setCheckpoints(updatedCheckpoints);

    try {
      // Bijgewerkte lijst checkpoints opslaan in de database
      await updateDoc(doc(db, 'checkpoints', gameId), {
        gameId,
        checkpoints: updatedCheckpoints
      });
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
            <button className='buttonX' onClick={() => handleDeleteCheckpoint(index)}>X</button>
          </li>
        ))}
      </ul>
      <NavigatieHost gameId={gameId} />
    </div>
  );
};

export default Checkpoints;
