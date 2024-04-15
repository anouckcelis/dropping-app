import React, { useState, useEffect } from 'react';
import { signOut, getAuth, onAuthStateChanged } from "firebase/auth";
import { updateDoc, doc } from 'firebase/firestore'; 
import { getFirestore } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Navigatie from './components/navigatie/navigatie';
import './account.css';

const Account = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Initialiseer je Firestore database
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Als de gebruiker is uitgelogd, stuur ze naar de startpagina
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
        await updateUserStatus(user.uid, false); // Zet isLogged op false wanneer de gebruiker uitlogt
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

  return (
    <div className="account-container">
      <h1>Account</h1>
      
      {user && (
        <p>Ingelogd met <strong>{user.email}</strong></p>
      )}

      <div>
        <button className='button' onClick={handleLogout}>Uitloggen</button>   
      </div>
      <Navigatie />
    </div>
  );
};

export default Account;

