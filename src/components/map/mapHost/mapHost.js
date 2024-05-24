// Importeer React en de nodige hooks
import React, { useState, useEffect } from 'react';

// Importeer Leaflet componenten voor kaartweergave
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Importeer Firebase authenticatie en Firestore database
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, where, query, getDoc } from 'firebase/firestore';

// Importeer CSS voor de map en navigatie host
import '../../map/mapHost/mapHost.css';
import { Icon } from 'leaflet';
import NavigatieHost from '../../navigatie/navigatieHost/navigatieHost';

// Importeer react-router-dom voor route parameters
import { useParams } from 'react-router-dom';

// Definieer de MapHost component
const MapHost = () => {
  // Haal de game ID uit de URL parameters
  const { gameId } = useParams();

  // Staatvariabelen voor locatiegegevens, nabijgelegen gebruikers, huidige gebruikerse-mail en checkpoints
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);

  // Gebruik useEffect om authenticatie status te controleren bij het laden van de component
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Als er een gebruiker is ingelogd, haal de locatie op, update de gebruikerstatus en haal checkpoints op
        fetchUserLocation();
        setCurrentUserEmail(user.email);
        markUserAsLogged(user.uid);
        fetchCheckpoints();
      }
    });

    // Zorg ervoor dat de abonnement wordt beëindigd bij het ongedaan maken van de component
    return () => unsubscribe();
  }, []);

  // Gebruik een interval om elke minuut de nabijgelegen gebruikers opnieuw te halen
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (userLocation) {
        fetchNearbyUsers();
      }
    }, 60 * 1000);

    // Zorg ervoor dat het interval wordt gestopt bij het ongedaan maken van de component
    return () => clearInterval(intervalId);
  }, [userLocation]);

  // Haal checkpoints op bij het laden van de component, afhankelijk van de gameId
  useEffect(() => {
    fetchCheckpoints();
  }, [gameId]);

  // Functie om de locatie van de gebruiker op te halen
  const fetchUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        // Update de locatie in Firestore
        updateUserLocation(getAuth().currentUser.uid, position.coords.latitude, position.coords.longitude, getAuth().currentUser.email);
      }, error => {
        console.error('Failed to fetch user location:', error);
      }
    );
  };

  // Functie om nabijgelegen gebruikers op te halen
  const fetchNearbyUsers = async () => {
    if (!userLocation) return;

    const db = getFirestore();
    const userLocationsRef = collection(db, 'userLocations');
    const maxDistance = 30;

    try {
      const querySnapshot = await getDocs(userLocationsRef);
      const nearbyUsersData = [];

      querySnapshot.forEach(doc => {
        const userData = doc.data();
        const distance = calculateDistance(userLocation.lat, userLocation.lng, userData.lat, userData.lng);

        if (distance <= maxDistance && userData.isLogged && userData.email !== currentUserEmail) {
          nearbyUsersData.push(userData);
        }
      });

      setNearbyUsers(nearbyUsersData);
    } catch (error) {
      console.error("Error fetching nearby users:", error);
    }
  };

  // Functie om checkpoints op te halen
  const fetchCheckpoints = async () => {
    if (!gameId) return;

    const db = getFirestore();
    const checkpointsRef = collection(db, 'checkpoints');
    let checkpointsData = [];

    try {
      const q = query(checkpointsRef, where("gameId", "==", gameId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(doc => {
        const checkpointData = doc.data();
        checkpointsData.push(checkpointData);
      });

      setCheckpoints(checkpointsData);
    } catch (error) {
      console.error("Error fetching checkpoints:", error);
    }
  };

  // Functie om de afstand tussen twee punten te berekenen
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Functie om graden naar radianen te converteren
  const toRadians = (value) => {
    return value * Math.PI / 180;
  };

  // Functie om een gebruiker als ingelogd te markeren
  const markUserAsLogged = (userId) => {
    const db = getFirestore();
    const userDocRef = doc(db, 'userLocations', userId);

    setDoc(userDocRef, { isLogged: true }, { merge: true })
     .then(() => {
        console.log("User marked as logged in Firestore!");
      })
     .catch((error) => {
        console.error("Error marking user as logged in Firestore:", error);
      });
  };

  // Functie om de locatie van een gebruiker in Firestore te updaten
  const updateUserLocation = (userId, lat, lng, email) => {
    const db = getFirestore();
    const userDocRef = doc(db, 'userLocations', userId);

    setDoc(userDocRef, {
      email: email,
      lat: lat,
      lng: lng,
      isLogged: true
    }, { merge: true })
     .then(() => {
        console.log("User location updated in Firestore!");
      })
     .catch((error) => {
        console.error("Error updating user location in Firestore:", error);
      });
  };

  const handleCatchButtonClick = async (email, user) => {
    // Controleer of de gebruikersgegevens zijn gedefinieerd
    if (!user) {
      console.error('Gebruikersgegevens zijn niet gedefinieerd.');
      return;
    }
  
    // Log de e-mail van de speler om te controleren of de ingelogde gebruiker de verwachte is
    console.log("E-mail van de speler:", email);
  
    // Bereken de afstand tussen de ingelogde gebruiker en de speler die gevangen wordt
    const distance = calculateDistance(userLocation.lat, userLocation.lng, user.lat, user.lng);
    const maxDistance = 10; // Maximale afstand om te vangen is 10 meter
  
    // Controleer of de speler binnen het vangbereik is
    if (distance <= maxDistance) {
      try {
        const db = getFirestore();
        const usersRef = collection(db, 'players');
        
        // Zoek de speler in de database op basis van het e-mailadres
        const querySnapshot = await getDocs(query(usersRef, where("email", "==", email)));
  
        if (!querySnapshot.empty) {
          // Als de speler is gevonden, werk het aantal keer dat hij is gevangen bij
          const userDocSnapshot = querySnapshot.docs[0];
          const userData = userDocSnapshot.data();
          const aantalKeerGecatcht = userData.aantalKeerGecatcht || 0;
  
          console.log("Gebruikersgegevens gevonden:", userData);
  
          await setDoc(userDocSnapshot.ref, { aantalKeerGecatcht: aantalKeerGecatcht + 1 }, { merge: true });
  
          // Verwijder de e-mail van de speler uit de gescande checkpoints
          await removePlayerScannedCheckpoints(email);
  
          console.log(`Aantal keer gecatcht voor ${email} is bijgewerkt.`);
        } else {
          console.error(`Speler met e-mail ${email} bestaat niet.`);
        }
      } catch (error) {
        console.error('Fout bij het bijwerken van het aantal keren dat de speler is gevangen:', error);
      }
    } else {
      console.error('Speler is buiten bereik om te vangen of de gameId komt niet overeen.');
    }
  };
  
  // Helperfunctie om de gescande checkpoints van een speler te verwijderen
  const removePlayerScannedCheckpoints = async (email) => {
    const db = getFirestore();
    const checkpointsRef = collection(db, 'checkpoints');
    const q = query(checkpointsRef, where("gameId", "==", gameId)); // Alleen filteren op gameId
  
    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const checkpointData = doc.data();
        
        // Controleer of de speler de checkpoint heeft gescand
        if (checkpointData.scannedBy && checkpointData.scannedBy.includes(email)) {
          // Verwijder de e-mail van de speler uit de scannedBy-array
          const updatedScannedBy = checkpointData.scannedBy.filter(userEmail => userEmail !== email);
          
          await setDoc(doc.ref, { scannedBy: updatedScannedBy }, { merge: true });
          console.log(`Checkpoint ${doc.id} bijgewerkt, ${email} verwijderd uit scannedBy.`);
        }
      });
    } catch (error) {
      console.error("Error removing player from scanned checkpoints:", error);
    }
  };
  
  // Definieer de iconen voor de markers op de kaart
  const icon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const checkpointIcon = new Icon ({
    iconUrl : 'https://img.icons8.com/doodle/48/flag.png',
    iconSize : [35, 35],
    iconAnchor : [17, 35],
    popupAnchor : [0, -35]
  });

  // Render de kaart en de markers
  return (
    <div className="map-wrapper">
      <div className="map-container">
        <MapContainer key={userLocation? `${userLocation.lat}-${userLocation.lng}` : 'default'} center={userLocation? [userLocation.lat, userLocation.lng] : [51.2195, 4.4024]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={icon}>
              <Popup>
                <p><strong>Mijn locatie</strong></p>
                <p>{currentUserEmail}</p>
              </Popup>
            </Marker>
          )}
          {nearbyUsers.map((user, index) => (
            <Marker key={index} position={[user.lat, user.lng]} icon={icon}>
              <Popup className='popUp-catch'>
                <p>{user.email}</p>
                <button className='button-catch-map' onClick={() => handleCatchButtonClick(user.email, user)}>Catch</button>
              </Popup>
            </Marker>
          ))}
          {checkpoints.map((checkpoint, index) => (
            <Marker key={index} position={[checkpoint.lat, checkpoint.lng]} icon={checkpointIcon}>
              <Popup>
                <p>{checkpoint.name}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <NavigatieHost gameId={gameId} />
    </div>
  );
};

export default MapHost;
