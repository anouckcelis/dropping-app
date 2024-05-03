// Importeer React en de useState en useEffect hooks voor het beheren van component state en effecten
import React, { useState, useEffect } from 'react';

// Importeer de NavigatieHost component voor navigatie binnen het spel
import NavigatieHost from '../src/components/navigatie/navigatieHost/navigatieHost';

// Importeer de nodige Firestore functies voor interactie met de database
import { getFirestore, collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';

// Importeer de CSS-bestand voor stijlen
import './checkpoints.css';

// Definieer de Checkpoints component met een gameId prop
const Checkpoints = ({ gameId }) => {
  // Gebruik useState om de waarden van checkpointName, latitude, longitude, en checkpoints te beheren
  const [checkpointName, setCheckpointName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [checkpoints, setCheckpoints] = useState([]);
  const db = getFirestore(); // Initialiseer de Firestore database

  // Gebruik useEffect om een effect te definiëren dat wordt uitgevoerd bij het mounten van de component en bij wijziging van gameId
  useEffect(() => {
    const loadCheckpoints = async () => {
      try {
        // Controleer of gameId niet undefined, null of leeg is
        if (gameId && gameId.trim()!== '') {
          const checkpointRef = doc(db, 'checkpoints', gameId);
          const checkpointDoc = await getDoc(checkpointRef);
          if (checkpointDoc.exists()) {
            const data = checkpointDoc.data();
            setCheckpoints(data.checkpoints || []);
          }
        }
      } catch (error) {
        console.error('Fout bij het laden van checkpoints:', error);
      }
    };
    loadCheckpoints();
  }, [db, gameId]); // Voeg gameId toe aan de afhankelijkheden van useEffect

  // Definieer de handleAddCheckpoint functie die wordt aangeroepen om een nieuw checkpoint toe te voegen
  const handleAddCheckpoint = async () => {
    if (checkpointName && latitude && longitude && gameId && gameId.trim()!== '') {
      const newCheckpoint = {
        name: checkpointName,
        lat: parseFloat(latitude),
        lng: parseFloat(longitude)
      };

      try {
        // Voeg het nieuwe checkpoint toe aan de 'checkpoints' collectie
        await addDoc(collection(db, 'checkpoints'), { gameId,...newCheckpoint });
        // Update de lokale checkpoints state
        setCheckpoints([...checkpoints, newCheckpoint]);
      } catch (error) {
        console.error('Fout bij het toevoegen van het checkpoint:', error);
      }

      // Reset de input velden
      setCheckpointName('');
      setLatitude('');
      setLongitude('');
    }
  };

  // Definieer de handleDeleteCheckpoint functie die wordt aangeroepen om een checkpoint te verwijderen
  const handleDeleteCheckpoint = async (index) => {
    const updatedCheckpoints = [...checkpoints];
    updatedCheckpoints.splice(index, 1);
    setCheckpoints(updatedCheckpoints);

    try {
      // Update de checkpoints in de database
      await updateDoc(doc(db, 'checkpoints', gameId), {
        gameId,
        checkpoints: updatedCheckpoints
      });
    } catch (error) {
      console.error('Fout bij het bijwerken van checkpoints na verwijdering:', error);
    }
  };

  // Render de component
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

// Exporteer de component zodat deze kan worden gebruikt in andere bestanden
export default Checkpoints;


