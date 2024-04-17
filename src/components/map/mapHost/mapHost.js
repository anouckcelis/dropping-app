import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import '../../map/mapHost/mapHost.css'
import NavigatieHost from '../../navigatie/navigatieHost/navigatieHost';

const MapHost = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserLocation();
        setCurrentUserEmail(user.email);
        markUserAsLogged(user.uid); // Markeer de huidige gebruiker als ingelogd
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyUsers();
    }
  }, [userLocation]);

  useEffect(() => {
    // Update elke 3 minuten
    const intervalId = setInterval(() => {
      if (userLocation) {
        fetchNearbyUsers();
      }
    }, 1 * 60 * 1000); 

    return () => clearInterval(intervalId); // Clear interval bij het unmounten
  }, [userLocation]);

  const fetchUserLocation = () => {
    navigator.geolocation.getCurrentPosition(position => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      updateUserLocation(getAuth().currentUser.uid, position.coords.latitude, position.coords.longitude, getAuth().currentUser.email); // E-mail wordt hier rechtstreeks doorgegeven
    }, error => {
      console.error('Failed to fetch user location:', error);
    });
  };
  

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

        // Alleen gebruikers met "isLogged" ingesteld op true weergeven
        if (distance <= maxDistance && userData.isLogged && userData.email !== currentUserEmail) {
          nearbyUsersData.push(userData);
        }
      });

      setNearbyUsers(nearbyUsersData);
    } catch (error) {
      console.error("Error fetching nearby users:", error);
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

  const updateUserLocation = (userId, lat, lng, email) => {
    const db = getFirestore();
    const userDocRef = doc(db, 'userLocations', userId);
  
    setDoc(userDocRef, {
      email: email,
      lat: lat,
      lng: lng,
      isLogged: true // Markeren als ingelogd bij het bijwerken van locatie
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

  return (
    <div className="map-wrapper">
      <div className="map-container">
        <MapContainer key={userLocation ? `${userLocation.lat}-${userLocation.lng}` : 'default'} center={userLocation ? [userLocation.lat, userLocation.lng] : [51.2195, 4.4024]} zoom={12} style={{ height: "100%", width: "100%" }}>
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
        </MapContainer>
      </div>
      <NavigatieHost />
    </div>
  );
};

export default MapHost;
