import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocs, where, collection, query, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom'; // Importeer de useParams hook
import NavigatiePlayer from '../../navigatie/navigatiePlayer/navigatiePlayer';

const QRScannerPlayer = () => {
    const [scanResult, setScanResult] = useState(null);
    const scannerRef = useRef(null);
    const db = getFirestore();
    const auth = getAuth();
    
    const { gameId } = useParams(); // Haal gameId op van de URL parameters

    useEffect(() => {
        initializeScanner();
    }, []);

    const initializeScanner = () => {
        if (!scannerRef.current) {
            const scanner = new Html5QrcodeScanner('reader', {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 5,
            });

            scanner.render(handleScanSuccess);
            scannerRef.current = scanner;
        }
    };

    const handleScanSuccess = async (scannedValue) => {
        setScanResult(scannedValue);
        await saveScannedCheckpoint(scannedValue, gameId);
    };

    const saveScannedCheckpoint = async (scannedValue, gameId) => {
        try {
            console.log('scannedValue:', scannedValue);
            console.log('gameId:', gameId);
    
            const user = auth.currentUser;
            if (!user) {
                console.error('Gebruiker is niet ingelogd.');
                return;
            }
    
            const userEmail = user.email;
    
            // Controleer of gameId is gedefinieerd
            if (!gameId) {
                console.error('gameId is niet gedefinieerd.');
                return;
            }
    
            // Bouw de query op basis van de naam en gameId
            let checkpointsQuery = collection(db, 'checkpoints');
            if (gameId) {
                checkpointsQuery = query(checkpointsQuery, where('gameId', '==', gameId));
            }
            checkpointsQuery = query(checkpointsQuery, where('name', '==', scannedValue));
    
            // Voer de query uit
            const checkpointsQuerySnapshot = await getDocs(checkpointsQuery);
    
            if (checkpointsQuerySnapshot.empty) {
                console.error('Checkpoint niet gevonden voor de opgegeven naam en gameId.');
                return;
            }
    
            // Loop door elk gevonden checkpoint en update het veld scannedBy
            checkpointsQuerySnapshot.forEach(async (doc) => {
                try {
                    // Hier kun je elk gevonden checkpoint verwerken
                    const checkpointData = doc.data();
                    console.log('Checkpoint gevonden:', checkpointData);
    
                    // Update het veld scannedBy met het e-mailadres van de ingelogde gebruiker
                    const checkpointRef = doc.ref;
                    let updatedScannedBy = [];
    
                    // Controleer of scannedBy al bestaat en kopieer het naar updatedScannedBy
                    if (checkpointData.scannedBy) {
                        updatedScannedBy = [...checkpointData.scannedBy];
                    }
    
                    // Voeg het e-mailadres van de ingelogde gebruiker toe aan updatedScannedBy
                    updatedScannedBy.push(userEmail);
    
                    await updateDoc(checkpointRef, {
                        scannedBy: updatedScannedBy
                    });
                    console.log('scannedBy veld is bijgewerkt met:', userEmail);
                } catch (error) {
                    console.error('Fout bij het bijwerken van het scannedBy veld:', error);
                }
            });
    
        } catch (error) {
            console.error('Fout bij het bijwerken van gescande checkpoints:', error);
        }
    };
    

    const handleScanAgain = () => {
        setScanResult(null);
    };

    return (
        <div className="qr-scanner">
            <h1>QR Scanner</h1>
            <div className="scanner-container" id="reader"></div>
            {scanResult ? (
                <div className="scan-result">
                    <p>Resultaat: <br /> <a href={"http://" + scanResult}>{scanResult}</a></p>
                    <button className="button-opnieuw" onClick={handleScanAgain}>Opnieuw scannen</button>
                </div>
            ) : null}
            <NavigatiePlayer gameId={gameId} />
        </div>
    );
};

export default QRScannerPlayer;
