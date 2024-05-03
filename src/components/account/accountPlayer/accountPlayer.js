// Importeer React en de nodige hooks
import React, { useState, useEffect } from 'react';

// Importeer Firebase authenticatie en Firestore database
import { signOut, getAuth, onAuthStateChanged } from "firebase/auth";
import { updateDoc, doc } from 'firebase/firestore'; 
import { getFirestore } from 'firebase/firestore';

// Importeer React Router voor navigatie
import { useNavigate, useParams } from 'react-router-dom';

// Importeer CSS voor de account player
import '../../account/accountPlayer/accountPlayer.css';
import NavigatiePlayer from '../../navigatie/navigatiePlayer/navigatiePlayer';

// Definieer de AccountPlayer component
const AccountPlayer = () => {
  // Initialiseer Firebase authenticatie en navigatie
  const auth = getAuth();
  const navigate = useNavigate();
  const { gameId } = useParams();

  // Staatvariabele voor de huidige gebruiker
  const [user, setUser] = useState(null);
  const db = getFirestore();

  // Gebruik useEffect om de authenticatie status te controleren bij het laden van de component
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Als er geen gebruiker is ingelogd, navigeer naar de startpagina
        navigate('/');
      } else {
        // Zet de huidige gebruiker
        setUser(user);
      }
    });

    // Zorg ervoor dat het abonnement wordt beëindigd bij het ongedaan maken van de component
    return () => unsubscribe();
  }, [auth, navigate]);

  // Functie om de gebruiker uit te loggen en de gebruikerstatus bij te werken
  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (user) {
        // Update de gebruikerstatus in Firestore
        await updateUserStatus(user.uid, false);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Functie om de gebruikerstatus in Firestore te updaten
  const updateUserStatus = async (userId, isLogged) => {
    try {
      const userDocRef = doc(db, 'userLocations', userId);
      await updateDoc(userDocRef, {
        isLogged: isLogged
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Functies om naar andere delen van de applicatie te navigeren
  const goToLeaderboard = () => {
    navigate(`/leaderboard/${gameId}`);
  };

  const goToLogbook = () => {
    navigate(`/logbook/${gameId}`);
  };

  // Render de account player interface
  return (
    <div className="account-container">
      <h1>Account</h1>
      
      {user && (
        <p>Ingelogd met <strong>{user.email}</strong></p>
      )}

      <div>
        <button className='button' onClick={handleLogout}>Uitloggen</button>   
      </div>
      <br />
      <br />

      <div>
        <button className='button' onClick={goToLeaderboard}>Ranking</button>  
        <button className='button' onClick={goToLogbook}>Logboek</button>   
      </div>
      <NavigatiePlayer gameId={gameId} />
    </div>
  );
};

export default AccountPlayer;
