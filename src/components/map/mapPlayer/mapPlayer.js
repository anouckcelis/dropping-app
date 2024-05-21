import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, where, query } from 'firebase/firestore';
import '../../map/mapPlayer/mapPlayer.css';
import { Icon } from 'leaflet';
import NavigatiePlayer from '../../navigatie/navigatiePlayer/navigatiePlayer';
import { useParams, useNavigate } from 'react-router-dom';

const MapPlayer = () => {
  const navigate = useNavigate();
  
  // Haal de gameId parameter uit de route-URL
  const { gameId } = useParams();

  // Definieer de states
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [scannedCheckpoints, setScannedCheckpoints] = useState([]); 
  const db = getFirestore();

  // Effect om de gebruikerslocatie op te halen en checkpoints te laden
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserLocation();
        setCurrentUserEmail(user.email);
        fetchCheckpoints();
        fetchScannedCheckpoints(); 
      }
    });

    return () => unsubscribe();
  }, []);

  // Effect om nabije gebruikers op te halen
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (userLocation) {
        fetchNearbyUsers();
      }
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [userLocation]);

  // Effect om checkpoints op te halen op basis van gameId
  useEffect(() => {
    fetchCheckpoints();
  }, [gameId]);

    // Functie om de gebruikerslocatie op te halen
    const fetchUserLocation = () => {
      navigator.geolocation.getCurrentPosition(position => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        updateUserLocation(getAuth().currentUser.uid, position.coords.latitude, position.coords.longitude, getAuth().currentUser.email);
      }, error => {
        console.error('Failed to fetch user location:', error);
      });
    };
  
    // Functie om nabije gebruikers op te halen
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
  
          if (distance <= maxDistance && userData.isLogged && userData.email!== currentUserEmail) {
            nearbyUsersData.push(userData);
          }
        });
  
        setNearbyUsers(nearbyUsersData);
      } catch (error) {
        console.error("Error fetching nearby users:", error);
      }
    };
  
    // Functie om checkpoints op te halen op basis van gameId
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

      // Functie om gescande checkpoints op te halen
  const fetchScannedCheckpoints = async () => {
    if (!gameId) return;

    const db = getFirestore();
    const scannedCheckpointsRef = collection(db, 'checkpoints');

    try {
      const querySnapshot = await getDocs(scannedCheckpointsRef);
      const scannedCheckpointsData = [];

      querySnapshot.forEach(doc => {
        const checkpointData = doc.data();
        if (checkpointData.scanned) {
          scannedCheckpointsData.push(checkpointData.name);
        }
      });

      setScannedCheckpoints(scannedCheckpointsData);
    } catch (error) {
      console.error("Error fetching scanned checkpoints:", error);
    }
  };

  // Functie om de afstand tussen twee coördinaten te berekenen
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

  // Functie om graden naar radialen om te zetten
  const toRadians = (value) => {
    return value * Math.PI / 180;
  };

  // Markeren van gebruiker als ingelogd in Firestore
  const markUserAsLogged = (userId) => {
    const db = getFirestore();
    const userDocRef = doc(db, 'userLocations', userId);

    setDoc(userDocRef, { isLogged: true }, { merge: true })
    .then(() => {
        console.log("User  as logged in Firestore!");
      })
    .catch((error) => {
        console.error("Error marking user as logged in Firestore:", error);
      });
  };

  // Update de locatie van de gebruiker in Firestore
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

  
  const icon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

    // Definieer het pictogram voor niet-gescande checkpoints
    const checkpointIcon = new Icon ({
      iconUrl : 'https://img.icons8.com/doodle/48/flag.png',
      iconSize : [35, 35],
      iconAnchor : [17, 35],
      popupAnchor : [0, -35]
    });
  
    // Definieer het pictogram voor gescande checkpoints
    const checkedIcon = new Icon({
      iconUrl: "",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  
    // Functie om een checkpoint te scannen
    const handleScanCheckpoint = async (checkpointName, email, user) => {
      console.log(`Checkpoint ${checkpointName} wordt gescand!`);
      navigate(`/qrscannerPlayer/${gameId}`);
    
      // Bereken de afstand tussen de ingelogde gebruiker en de speler die gevangen wordt
      const distance = calculateDistance(userLocation.lat, userLocation.lng, user.lat, user.lng);
      const maxDistance = 10; // Maximale afstand om te vangen is 10 meter
    
      if (distance <= maxDistance) {
        try {
          const db = getFirestore();
          const usersRef = collection(db, 'players');
    
          const querySnapshot = await getDocs(query(usersRef, where("email", "==", email)));
    
          if (!querySnapshot.empty) {
            const userDocSnapshot = querySnapshot.docs[0];
            const userData = userDocSnapshot.data();
            const aantalGescandeCheckpoints = userData.aantalGescandeCheckpoints || 0;
    
            console.log("Gebruikersgegevens gevonden:", userData);
    
            await setDoc(userDocSnapshot.ref, { aantalGescandeCheckpoints: aantalGescandeCheckpoints + 1 }, { merge: true });
    
            console.log(`Aantal gescande checkpoints voor ${email} is bijgewerkt.`);
          } else {
            console.error(`Gebruiker met e-mail ${email} bestaat niet.`);
          }
        } catch (error) {
          console.error('Fout bij het bijwerken van het aantal gescande checkpoints:', error);
        }
      }
    };

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
              <Popup>
                <p>{user.email}</p>
              </Popup>
            </Marker>
          ))}
          {checkpoints.map((checkpoint, index) => (
            <Marker key={index} position={[checkpoint.lat, checkpoint.lng]} icon={checkpointIcon}>
              <Popup className='popUp-checkpoint'>
                <p>{checkpoint.name}</p>
                <button className='button-checkpoint-map' onClick={() => handleScanCheckpoint(checkpoint.name, currentUserEmail, checkpoint)}>Scan QR</button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <NavigatiePlayer gameId={gameId}/>
    </div>
  );
};

export default MapPlayer;
