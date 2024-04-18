import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Start from './start.js';
import Login from './login.js';
import Home from './home.js';
import MapHost from './components/map/mapHost/mapHost.js';
import MapPlayer from './components/map/mapPlayer/mapPlayer.js'
import QRScanner from './components/scanner/qrscanner.js';
import Account from './account.js';
import Register from './register.js';
import NewGame from './newGame.js';
import Checkpoints from './checkpoints.js';
import ParticipateGame from './participateGame.js'
import './App.css';

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
          <Route path="/mapHost" element={<MapHost />} />
          <Route path="/mapPlayer" element={<MapPlayer />} />
          <Route path="/qrscanner" element={<QRScanner/>} />
          <Route path="/account" element={<Account />} />
          <Route path="/newGame/:gameId" element={<NewGame />} />
          <Route path="/checkpoints" element={<Checkpoints />} />
          <Route path="/participateGame" element={<ParticipateGame />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

