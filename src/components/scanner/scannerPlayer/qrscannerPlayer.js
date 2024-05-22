import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocs, where, collection, query, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom'; // Importeer de useParams hook om URL parameters op te halen
import NavigatiePlayer from '../../navigatie/navigatiePlayer/navigatiePlayer';

// Definitie van de QRScannerPlayer component
const QRScannerPlayer = () => {
    // State om scanresultaat op te slaan
    const [scanResult, setScanResult] = useState(null);
    // Ref om de scanner instantie op te slaan
    const scannerRef = useRef(null);
    // Firestore database instantie
    const db = getFirestore();
    // Firebase authenticatie instantie
    const auth = getAuth();
    
    // Haal gameId op van de URL parameters
    const { gameId } = useParams(); 

    // useEffect hook om de scanner te initialiseren bij het laden van de component
    useEffect(() => {
        initializeScanner();
    }, []);

    // Functie om de QR-code scanner te initialiseren
    const initializeScanner = () => {
        if (!scannerRef.current) {
            const scanner = new Html5QrcodeScanner('reader', {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 5,
            });

            // Render de scanner en stel de succes callback in
            scanner.render(handleScanSuccess);
            scannerRef.current = scanner;
        }
    };

    // Callback functie voor een succesvolle scan
    const handleScanSuccess = async (scannedValue) => {
        setScanResult(scannedValue);
        await saveScannedCheckpoint(scannedValue, gameId);
    };

    // Functie om gescande checkpoint gegevens op te slaan
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
                    const checkpointData = doc.data();
                    console.log('Checkpoint gevonden:', checkpointData);
    
                    const checkpointRef = doc.ref;
                    let updatedScannedBy = [];
    
                    if (checkpointData.scannedBy) {
                        updatedScannedBy = [...checkpointData.scannedBy];
                    }
    
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
    
    // Functie om opnieuw te scannen
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
