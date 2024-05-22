import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { Icon } from 'leaflet';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, where, query, updateDoc, arrayUnion } from 'firebase/firestore';
import '../../map/mapPlayer/mapPlayer.css';
import NavigatiePlayer from '../../navigatie/navigatiePlayer/navigatiePlayer';
import { useParams, useNavigate } from 'react-router-dom';

const MapPlayer = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();

  const [userLocation, setUserLocation] = useState(null); // Huidige locatie van de gebruiker
  const [nearbyUsers, setNearbyUsers] = useState([]);     // Lijst van nabijgelegen gebruikers
  const [currentUserEmail, setCurrentUserEmail] = useState(null); // E-mailadres van de huidige gebruiker
  const [checkpoints, setCheckpoints] = useState([]);    // Lijst van checkpoints
  const [alreadyScanned, setAlreadyScanned] = useState(false); // Geeft aan of een checkpoint al is gescand
  const db = getFirestore(); // Initialisatie van de Firestore database

  useEffect(() => {
  const auth = getAuth(); // Authenticatie initialisatie
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchUserLocation(); // Functie om de locatie van de gebruiker op te halen
      setCurrentUserEmail(user.email); // Huidig gebruikerse-mail instellen
      fetchCheckpoints(); // Functie om checkpoints op te halen
      fetchUserScannedCheckpoints(user.email); // Functie om gescande checkpoints van de gebruiker op te halen
    }
  });

  // Retourneert een functie die wordt uitgevoerd wanneer de component wordt gedemonteerd
  return () => unsubscribe(); // Annuleert de onAuthStateChanged luisteraar
}, []); // Lege array als tweede argument geeft aan dat deze hook slechts één keer wordt uitgevoerd, bij het mounten van de component


 useEffect(() => {
  const intervalId = setInterval(() => {
    if (userLocation) {
      fetchNearbyUsers(); // Functie om nabijgelegen gebruikers op te halen
    }
  }, 60 * 1000); // Interval van 60 seconden om periodiek nabijgelegen gebruikers op te halen

  // Retourneert een functie die wordt uitgevoerd wanneer de component wordt gedemonteerd
  return () => clearInterval(intervalId); // Annuleert het interval wanneer de component wordt gedemonteerd
}, [userLocation]); // Wordt opnieuw uitgevoerd wanneer 'userLocation' verandert

useEffect(() => {
  fetchCheckpoints(); // Functie om checkpoints op te halen
}, [gameId]); // Wordt opnieuw uitgevoerd wanneer 'gameId' verandert

// Functie om de locatie van de gebruiker op te halen
const fetchUserLocation = () => {
  navigator.geolocation.getCurrentPosition(position => {
    setUserLocation({
      lat: position.coords.latitude, // Breedtegraad van de locatie van de gebruiker
      lng: position.coords.longitude // Lengtegraad van de locatie van de gebruiker
    });
    updateUserLocation(getAuth().currentUser.uid, position.coords.latitude, position.coords.longitude, getAuth().currentUser.email); // Functie om de locatie van de gebruiker bij te werken in de database
  }, error => {
    console.error('Failed to fetch user location:', error); // Logt een fout als het ophalen van de locatie mislukt
  });
};


  // Functie om nabijgelegen gebruikers op te halen
const fetchNearbyUsers = async () => {
  if (!userLocation) return; // Als de gebruikerslocatie niet beschikbaar is, stop dan de functie

  const userLocationsRef = collection(db, 'userLocations'); // Verwijzing naar de collectie 'userLocations' in de database
  const maxDistance = 30; // Maximale afstand in kilometers om gebruikers als 'nabijgelegen' te beschouwen

  try {
    const querySnapshot = await getDocs(userLocationsRef); // Haalt alle documenten op uit de collectie 'userLocations'
    const nearbyUsersData = []; // Array om gegevens van nabijgelegen gebruikers op te slaan

    querySnapshot.forEach(doc => {
      const userData = doc.data(); // Haalt de gegevens op van elk document
      const distance = calculateDistance(userLocation.lat, userLocation.lng, userData.lat, userData.lng); // Bereken de afstand tussen de gebruiker en andere gebruikers

      // Controleert of de gebruiker binnen de maximale afstand is, is ingelogd en niet de huidige gebruiker is
      if (distance <= maxDistance && userData.isLogged && userData.email !== currentUserEmail) {
        nearbyUsersData.push(userData); // Voegt de gebruikersgegevens toe aan de lijst van nabijgelegen gebruikers
      }
    });

    setNearbyUsers(nearbyUsersData); // Stelt de staat in met de gegevens van nabijgelegen gebruikers
  } catch (error) {
    console.error("Error fetching nearby users:", error); // Logt een fout als het ophalen van nabijgelegen gebruikers mislukt
  }
};

 // Functie om checkpoints op te halen
const fetchCheckpoints = async () => {
  if (!gameId) return; // Als gameId niet beschikbaar is, stop dan de functie

  const checkpointsRef = collection(db, 'checkpoints'); // Verwijzing naar de collectie 'checkpoints' in de database
  let checkpointsData = []; // Array om checkpointgegevens op te slaan

  try {
    const q = query(checkpointsRef, where("gameId", "==", gameId)); // Query om checkpoints te filteren op gameId
    const querySnapshot = await getDocs(q); // Voert de query uit en haalt de snapshot van de resultaten op

    querySnapshot.forEach(doc => {
      const checkpointData = doc.data(); // Haalt de gegevens op van elk document
      checkpointData.scannedByCurrentUser = false; // Voegt een veld toe om bij te houden of het checkpoint is gescand door de huidige gebruiker
      checkpointsData.push(checkpointData); // Voegt de checkpointgegevens toe aan de lijst van checkpoints
    });

    setCheckpoints(checkpointsData); // Stelt de staat in met de gegevens van de checkpoints
  } catch (error) {
    console.error("Error fetching checkpoints:", error); // Logt een fout als het ophalen van checkpoints mislukt
  }
};


// Functie om gescande checkpoints van de gebruiker op te halen
const fetchUserScannedCheckpoints = async (email) => {
  try {
    const checkpointsRef = collection(db, 'checkpoints'); // Verwijzing naar de collectie 'checkpoints' in de database
    const q = query(checkpointsRef, where("scannedBy", "array-contains", email)); // Query om checkpoints te filteren op gescande gebruiker
    const querySnapshot = await getDocs(q); // Voert de query uit en haalt de snapshot van de resultaten op
    const scannedCheckpoints = querySnapshot.docs.map(doc => doc.data().name); // Haalt de namen van gescande checkpoints op

    // Update de staat met de informatie of elk checkpoint is gescand door de huidige gebruiker
    setCheckpoints(prevCheckpoints => prevCheckpoints.map(checkpoint => ({
      ...checkpoint,
      scannedByCurrentUser: scannedCheckpoints.includes(checkpoint.name) // Controleert of het checkpoint is gescand door de huidige gebruiker
    })));
  } catch (error) {
    console.error("Error fetching user's scanned checkpoints:", error); // Logt een fout als het ophalen van gescande checkpoints mislukt
  }
};

// Functie om de afstand tussen twee punten op aarde te berekenen (in kilometers)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Straal van de aarde in kilometers
  const dLat = toRadians(lat2 - lat1); // Verschil in breedtegraad, omgezet naar radialen
  const dLon = toRadians(lon2 - lon1); // Verschil in lengtegraad, omgezet naar radialen
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2); // Haversine-formule voor berekening
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // Hoek tussen de punten
  const distance = R * c; // Afstand berekend met behulp van de haversine-formule
  return distance; // Afstand in kilometers
};

// Functie om graden naar radialen om te zetten
const toRadians = (value) => {
  return value * Math.PI / 180; // Omrekeningsformule van graden naar radialen
};


 // Functie om de locatie van de gebruiker bij te werken in Firestore
const updateUserLocation = (userId, lat, lng, email) => {
  const userDocRef = doc(db, 'userLocations', userId); // Verwijzing naar het document van de gebruiker in de collectie 'userLocations'

  setDoc(userDocRef, {
    email: email, // E-mailadres van de gebruiker
    lat: lat, // Breedtegraad van de locatie van de gebruiker
    lng: lng, // Lengtegraad van de locatie van de gebruiker
    isLogged: true // Geeft aan dat de gebruiker is ingelogd
  }, { merge: true }) // Voegt nieuwe velden toe aan het document of werkt bestaande velden bij
  .then(() => {
    console.log("User location updated in Firestore!"); // Logt een succesbericht wanneer de locatie van de gebruiker succesvol is bijgewerkt
  })
  .catch((error) => {
    console.error("Error updating user location in Firestore:", error); // Logt een fout als het bijwerken van de locatie mislukt
  });
};

// Pictogram voor gebruikerslocatie op de kaart
const icon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png', // URL van het pictogram
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', // URL van de schaduw voor het pictogram
  iconSize: [25, 41], // Grootte van het pictogram
  iconAnchor: [12, 41], // Ankerpunt van het pictogram
  popupAnchor: [1, -34], // Ankerpunt voor de popup van het pictogram
  shadowSize: [41, 41] // Grootte van de schaduw
});

// Pictogram voor checkpoints op de kaart
const checkpointIcon = new Icon ({
  iconUrl : 'https://img.icons8.com/doodle/48/flag.png', // URL van het checkpoint-pictogram
  iconSize : [35, 35], // Grootte van het pictogram
  iconAnchor : [17, 35], // Ankerpunt van het pictogram
  popupAnchor : [0, -35] // Ankerpunt voor de popup van het pictogram
});


  // Functie om een checkpoint te scannen
const handleScanCheckpoint = async (checkpointName, email, user) => {
  console.log(`Checkpoint ${checkpointName} wordt gescand!`); // Logt een bericht dat het checkpoint wordt gescand
  navigate(`/qrscannerPlayer/${gameId}`); // Navigeert naar de QR-scannerpagina voor spelers

  const distance = calculateDistance(userLocation.lat, userLocation.lng, user.lat, user.lng); // Bereken de afstand tussen de gebruiker en het checkpoint
  const maxDistance = 10; // Maximale afstand in kilometers om een checkpoint te kunnen scannen

  if (distance <= maxDistance) { // Controleert of de afstand tussen de gebruiker en het checkpoint binnen het toegestane bereik ligt
    try {
      const userQuerySnapshot = await getDocs(query(collection(db, 'players'), where("email", "==", email))); // Haalt de gegevens op van de speler met het opgegeven e-mailadres

      if (!userQuerySnapshot.empty) { // Controleert of de queryresultaten niet leeg zijn
        const userDocSnapshot = userQuerySnapshot.docs[0]; // Haalt de eerste gevonden documentopname op
        const userData = userDocSnapshot.data(); // Haalt de gegevens op van de gebruiker

        const aantalGescandeCheckpoints = userData.aantalGescandeCheckpoints || 0; // Haalt het aantal gescande checkpoints van de gebruiker op

        const checkpointIndex = checkpoints.findIndex(checkpoint => checkpoint.name === checkpointName); // Zoekt het checkpoint op basis van de naam

        if (checkpointIndex !== -1 && checkpoints[checkpointIndex].scannedByCurrentUser) {
          setAlreadyScanned(true); // Stelt in dat het checkpoint al is gescand door de huidige gebruiker
          return;
        }

        await setDoc(userDocSnapshot.ref, { aantalGescandeCheckpoints: aantalGescandeCheckpoints + 1 }, { merge: true }); // Werkt het aantal gescande checkpoints voor de gebruiker bij in de database

        if (checkpointIndex !== -1) {
          const updatedCheckpoints = [...checkpoints];
          updatedCheckpoints[checkpointIndex].scannedByCurrentUser = true;
          setCheckpoints(updatedCheckpoints); // Markeert het checkpoint als gescand door de huidige gebruiker in de staat
        }

        const checkpointDocRef = doc(db, 'checkpoints', checkpointName); // Verwijzing naar het document van het gescande checkpoint
        await updateDoc(checkpointDocRef, {
          scannedBy: arrayUnion(email) // Voegt de e-mail van de gebruiker toe aan het gescande checkpoint
        });
      } else {
        console.error(`Gebruiker met e-mail ${email} bestaat niet.`); // Logt een fout als de gebruiker niet wordt gevonden
      }
    } catch (error) {
      console.error('Fout bij het bijwerken van het aantal gescande checkpoints:', error); // Logt een fout als er een fout optreedt bij het bijwerken van het aantal gescande checkpoints
    }
  }
};


return (
  <div className="map-wrapper">
    <div className="map-container">
      {/* Kaartcontainer */}
      <MapContainer 
        key={userLocation ? `${userLocation.lat}-${userLocation.lng}` : 'default'} // Key om de kaartcomponent opnieuw te renderen bij wijzigingen in de gebruikerslocatie
        center={userLocation ? [userLocation.lat, userLocation.lng] : [51.2195, 4.4024]} // Middelpunt van de kaart ingesteld op de gebruikerslocatie, of standaardwaarden als de locatie niet beschikbaar is
        zoom={12} // Zoomniveau van de kaart
        style={{ height: "100%", width: "100%" }} // Stijl om de kaart op te vullen binnen de oudercomponent
      >
        {/* Tegel-laag voor de kaart */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // URL voor de tegel-laag
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' // Toegeschreven aan OpenStreetMap
        />
        {/* Markering voor de gebruikerslocatie */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={icon}> // Markering voor de gebruikerslocatie met aangepast pictogram
            <Popup>
              <p><strong>Mijn locatie</strong></p>
              <p>{currentUserEmail}</p>
            </Popup>
          </Marker>
        )}
        {/* Markeringen voor nabijgelegen gebruikers */}
        {nearbyUsers.map((user, index) => (
          <Marker key={index} position={[user.lat, user.lng]} icon={icon}> // Markering voor elke nabijgelegen gebruiker met aangepast pictogram
            <Popup>
              <p>{user.email}</p>
            </Popup>
          </Marker>
        ))}
        {/* Markeringen voor checkpoints */}
        {checkpoints.map((checkpoint, index) => (
          <Marker key={index} position={[checkpoint.lat, checkpoint.lng]} icon={checkpointIcon}> // Markering voor elk checkpoint met aangepast pictogram
            <Popup className='popUp-checkpoint'>
              <p>{checkpoint.name}</p>
              {checkpoint.scannedByCurrentUser ? ( // Controleert of het checkpoint is gescand door de huidige gebruiker
                <p>Al gescand!</p>
              ) : (
                <button className='button-checkpoint-map' onClick={() => handleScanCheckpoint(checkpoint.name, currentUserEmail, checkpoint)}>Scan QR</button> // Knop om het checkpoint te scannen
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
    {/* Navigatiebalk voor spelers */}
    <NavigatiePlayer gameId={gameId}/>
  </div>
);
}
export default MapPlayer;
