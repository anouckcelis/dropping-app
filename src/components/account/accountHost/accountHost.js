import React, { useState, useEffect } from 'react';
import { signOut, getAuth, onAuthStateChanged } from "firebase/auth";
import { updateDoc, doc } from 'firebase/firestore'; 
import { getFirestore } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom'; // Voeg useParams toe
import '../../account/accountHost/accountHost.css';
import NavigatieHost from '../../navigatie/navigatieHost/navigatieHost';

const AccountHost = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [user, setUser] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/');
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (user) {
        await updateUserStatus(user.uid, false);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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

  const navigateToLeaderboard = () => {
    navigate(`/leaderboard/${gameId}`); // Navigeer naar de ranglijstpagina met gameId
  };

  const navigateToLogbook = () => {
    navigate(`/logbook/${gameId}`); // Navigeer naar het logboek met gameId
  };

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
        <button className='button' onClick={navigateToLeaderboard}>Ranglijst</button>  
        <button className='button' onClick={navigateToLogbook}>Logboek</button>   
      </div>
      <NavigatieHost gameId={gameId} />
    </div>
  );
};

export default AccountHost;
 

