import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import Start from './start.js';
import Login from './login.js';
import Home from './home.js';
import MapHost from './components/map/mapHost/mapHost.js';
import MapPlayer from './components/map/mapPlayer/mapPlayer.js';
import QRScannerHost from './components/scanner/scannerHost/qrscannerHost.js';
import QRScannerPlayer from './components/scanner/scannerPlayer/qrscannerPlayer.js';
import AccountHost from './components/account/accountHost/accountHost.js';
import AccountPlayer from './components/account/accountPlayer/accountPlayer.js';
import Register from './register.js';
import NewGame from './newGame.js';
import Checkpoints from './checkpoints.js';
import ParticipateGame from './participateGame.js';
import Leaderboard from './leaderboard.js'; // Importeer de ranglijstpagina
import Logbook from './logbook.js'; // Importeer de logboekpagina
import './App.css';
import firebase from './firebase.js';

// Definieer een nieuwe component voor het extraheren van gameId uit de URL
const ExtractedGameId = () => {
  const { gameId } = useParams(); // Haal gameId uit de URL
  return null; // Deze component doet verder niets, maar haalt gameId uit de URL
};

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Start/>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setLoggedIn={setLoggedIn} setEmail={setEmail} />} />
          <Route path="/home" element={<Home />} />
          <Route path="/mapHost/:gameId/*" element={<><ExtractedGameId /><MapHost /></>} />
          <Route path="/mapPlayer/:gameId/*" element={<><ExtractedGameId /><MapPlayer /></>} />
          <Route path="/qrscannerHost/:gameId/*" element={<><ExtractedGameId /><QRScannerHost /></>} />
          <Route path="/qrscannerPlayer/:gameId/*" element={<><ExtractedGameId /><QRScannerPlayer /></>} />
          <Route path="/accountHost/:gameId/*" element={<><ExtractedGameId /><AccountHost /></>} />
          <Route path="/accountPlayer/:gameId/*" element={<><ExtractedGameId /><AccountPlayer /></>} />
          <Route path="/newGame/:gameId" element={<NewGame />} />
          <Route path="/checkpoints/:gameId" element={<Checkpoints />} />
          <Route path="/participateGame" element={<ParticipateGame />} />
          <Route path="/leaderboard/:gameId" element={<Leaderboard />} /> {/* Voeg de ranglijstpagina toe */}
          <Route path="/logbook/:gameId" element={<><ExtractedGameId /><Logbook /></>} />


        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;



