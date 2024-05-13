import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getAuth } from 'firebase/auth';
import { getFirestore, updateDoc, getDocs, collection, query, where, doc } from 'firebase/firestore';
import NavigatiePlayer from '../../navigatie/navigatiePlayer/navigatiePlayer';

const QRScannerPlayer = ({ gameId }) => {
    const [scanResult, setScanResult] = useState(null);
    const scannerRef = useRef(null);
    const db = getFirestore();
    const auth = getAuth();

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

    const handleScanSuccess = async (checkpointId) => {
        setScanResult(checkpointId);
        await saveScannedCheckpoint(checkpointId); // Wacht op het opslaan van het gescande checkpoint
    };
    
    const saveScannedCheckpoint = async (checkpointId) => {
        try {
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
    
            const emailQuery = query(collection(db, 'players'), where('email', '==', userEmail));
            const gameIdQuery = query(collection(db, 'players'), where('gameId', '==', gameId));
            const [emailQuerySnapshot, gameIdQuerySnapshot] = await Promise.all([getDocs(emailQuery), getDocs(gameIdQuery)]);
            
            const matchingPlayers = emailQuerySnapshot.docs.filter(doc =>
                gameIdQuerySnapshot.docs.some(snapshotDoc => snapshotDoc.id === doc.id)
            );
    
            if (matchingPlayers.length > 0) {
                for (const doc of matchingPlayers) {
                    const playerRef = doc.ref;
                    const playerData = doc.data();
                    const aantalGescandeCheckpoints = playerData.aantalGescandeCheckpoints || 0;
                    await updateDoc(playerRef, { aantalGescandeCheckpoints: aantalGescandeCheckpoints + 1 });
                }
            } else {
                console.error('Geen overeenkomende speler gevonden voor ingelogde gebruiker en gameId:', userEmail, gameId);
            }
    
            // Markeer het gescande checkpoint als gescand
            const checkpointDocRef = doc(db, 'checkpoints', checkpointId);
            await updateDoc(checkpointDocRef, { scanned: true });
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
