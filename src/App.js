import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
import ParticipateGame from './participateGame.js'
import './App.css';
import firebase from './firebase.js'

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
          <Route path="/mapHost/:gameId" element={<MapHost />} />
          <Route path="/mapPlayer/:gameId" element={<MapPlayer />} />
          <Route path="/qrscannerHost" element={<QRScannerHost/>} />
          <Route path="/qrscannerPlayer" element={<QRScannerPlayer/>} />
          <Route path="/accountHost" element={<AccountHost />} />
          <Route path="/accountPlayer" element={<AccountPlayer />} />
          <Route path="/newGame/:gameId" element={<NewGame />} />
          <Route path="/checkpoints/:gameId" element={<Checkpoints />} />
          <Route path="/participateGame" element={<ParticipateGame />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

