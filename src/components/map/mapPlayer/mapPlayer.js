import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { Icon } from 'leaflet';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, where, query, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import '../../map/mapPlayer/mapPlayer.css';
import NavigatiePlayer from '../../navigatie/navigatiePlayer/navigatiePlayer';
import { useParams, useNavigate } from 'react-router-dom';

const MapPlayer = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();

  const [userLocation, setUserLocation] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [alreadyScanned, setAlreadyScanned] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);

  const db = getFirestore();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserLocation();
        setCurrentUserEmail(user.email);
        fetchCheckpoints();
        fetchUserScannedCheckpoints(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (userLocation) {
        fetchNearbyUsers();
      }
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [userLocation]);

  useEffect(() => {
    fetchCheckpoints();
  }, [gameId]);

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

  const fetchNearbyUsers = async () => {
    if (!userLocation) return;

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

  const fetchCheckpoints = async () => {
    if (!gameId) return;

    const checkpointsRef = collection(db, 'checkpoints');
    let checkpointsData = [];

    try {
      const q = query(checkpointsRef, where("gameId", "==", gameId));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(doc => {
        const checkpointData = doc.data();
        checkpointData.scannedByCurrentUser = false;
        checkpointsData.push(checkpointData);
      });

      setCheckpoints(checkpointsData);
    } catch (error) {
      console.error("Error fetching checkpoints:", error);
    }
  };

  const fetchUserScannedCheckpoints = async (email) => {
    try {
      const checkpointsRef = collection(db, 'checkpoints');
      const q = query(checkpointsRef, where("scannedBy", "array-contains", email));
      const querySnapshot = await getDocs(q);
      const scannedCheckpoints = querySnapshot.docs.map(doc => doc.data().name);

      setCheckpoints(prevCheckpoints => prevCheckpoints.map(checkpoint => ({
        ...checkpoint,
        scannedByCurrentUser: scannedCheckpoints.includes(checkpoint.name)
      })));
    } catch (error) {
      console.error("Error fetching user's scanned checkpoints:", error);
    }
  };

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

  const toRadians = (value) => {
    return value * Math.PI / 180;
  };

  const updateUserLocation = (userId, lat, lng, email) => {
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

  const checkpointIcon = new Icon({
    iconUrl: 'https://img.icons8.com/doodle/48/flag.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  });

  const handleScanCheckpoint = async (checkpointName, email, checkpoint) => {
    console.log(`Checkpoint ${checkpointName} wordt gescand!`);
    navigate(`/qrscannerPlayer/${gameId}`);
  
    const distance = calculateDistance(userLocation.lat, userLocation.lng, checkpoint.lat, checkpoint.lng);
    const maxDistance = 10;
  
    if (distance <= maxDistance) {
      try {
        const userQuerySnapshot = await getDocs(query(collection(db, 'players'), where("email", "==", email)));
  
        if (!userQuerySnapshot.empty) {
          const userDocSnapshot = userQuerySnapshot.docs[0];
          const userData = userDocSnapshot.data();
  
          const aantalGescandeCheckpoints = userData.aantalGescandeCheckpoints || 0;
          const checkpointIndex = checkpoints.findIndex(cp => cp.name === checkpointName);
  
          if (checkpointIndex !== -1 && checkpoints[checkpointIndex].scannedByCurrentUser) {
            setAlreadyScanned(true);
            return;
          }
  
          await setDoc(userDocSnapshot.ref, { aantalGescandeCheckpoints: aantalGescandeCheckpoints + 1 }, { merge: true });
  
          if (checkpointIndex !== -1) {
            const updatedCheckpoints = [...checkpoints];
            updatedCheckpoints[checkpointIndex].scannedByCurrentUser = true;
            setCheckpoints(updatedCheckpoints);
          }
  
          const checkpointsRef = collection(db, 'checkpoints');
          const checkpointQuerySnapshot = await getDocs(query(checkpointsRef, where("name", "==", checkpointName)));
          const checkpointDocRef = checkpointQuerySnapshot.docs[0].ref;
  
          await updateDoc(checkpointDocRef, {
            scannedBy: arrayUnion(email)
          });
  
          if (checkpointName === "Einde") {
            const checkpointData = (await getDoc(checkpointDocRef)).data();
            if (checkpointData.scannedBy[0] === email) {
              setGameEnded(true);
              setWinner(currentUserEmail);
            }
          }
          console.log(`Het spel is geëindigd: ${gameEnded} en de winnaar is: ${winner}`);
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
        <MapContainer
          key={userLocation ? `${userLocation.lat}-${userLocation.lng}` : 'map-container'}
          center={userLocation ? [userLocation.lat, userLocation.lng] : [51.505, -0.09]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
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
                {checkpoint.scannedByCurrentUser ? (
                  <p>Al gescand!</p>
                ) : (
                  <button className='button-checkpoint-map' onClick={() => handleScanCheckpoint(checkpoint.name, currentUserEmail, checkpoint)}>Scan QR</button>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <NavigatiePlayer gameId={gameId} />
    </div>
  );
}

export default MapPlayer;
