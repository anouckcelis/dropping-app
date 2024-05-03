import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, where, query } from 'firebase/firestore';
import '../../map/mapPlayer/mapPlayer.css';
import { Icon } from 'leaflet';
import NavigatiePlayer from '../../navigatie/navigatiePlayer/navigatiePlayer';
import { useParams } from 'react-router-dom';

const MapPlayer = () => {
  // State voor de locatie van de gebruiker, nabijgelegen gebruikers, e-mail van de huidige gebruiker en checkpoints
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const { gameId } = useParams(); // Haalt de gameId parameter uit de route-URL

  // Volgt de aanmeldingsstatus van de gebruiker. Als de gebruiker is aangemeld, haalt het de locatie op, stelt de e-mail in, markeert de gebruiker als ingelogd en haalt de checkpoints op.
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserLocation();
        setCurrentUserEmail(user.email);
        markUserAsLogged(user.uid);
        fetchCheckpoints();
      }
    });

    return () => unsubscribe();
  }, []);

  // Elke 60 seconden controleert of de gebruikerlocatie beschikbaar is en haalt nabijgelegen gebruikers op.
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (userLocation) {
        fetchNearbyUsers();
      }
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [userLocation]);

  // Haalt checkpoints op op basis van de gameId bij het laden van de component
  useEffect(() => {
    fetchCheckpoints();
  }, [gameId]);

  // Haalt de huidige locatie van de gebruiker op via de browser-API
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

  // Haalt nabijgelegen gebruikers op op basis van hun locatie en de maximale afstand
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

  // Haalt checkpoints op op basis van de gameId
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

  // Berekent de afstand tussen twee punten op de aarde
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius van de aarde in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Afstand in km
    return distance;
  };

  // Converteert graden naar radianen
  const toRadians = (value) => {
    return value * Math.PI / 180;
  };

  // Markeert de gebruiker als ingelogd in Firestore
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

  // Definieert de icon voor de gebruiker op de kaart
  const icon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Definieert de icon voor checkpoints op de kaart
  const checkpointIcon = new Icon ({
    iconUrl : 'https://img.icons8.com/doodle/48/flag.png',
    iconSize : [35, 35],
    iconAnchor : [17, 35],
    popupAnchor : [0, -35]
  });

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
              <Popup>
                <p>{checkpoint.name}</p>
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


