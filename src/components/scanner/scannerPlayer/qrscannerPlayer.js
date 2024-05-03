// Importeer React en de useState, useEffect, en useRef hooks voor het beheren van component state, effecten, en referenties
import React, { useState, useEffect, useRef } from 'react';

// Importeer de Html5QrcodeScanner component uit de html5-qrcode bibliotheek voor QR-scanning
import { Html5QrcodeScanner } from 'html5-qrcode';

// Importeer de CSS-bestand voor stijlen
import '../../scanner/scannerPlayer/qrscannerPlayer.css';

// Importeer de NavigatiePlayer component voor navigatie binnen het spel
import NavigatiePlayer from '../../navigatie/navigatiePlayer/navigatiePlayer';

// Definieer de QRScannerPlayer component met een gameId prop
const QRScannerPlayer = ({ gameId }) => {
    // Gebruik useState om de scanResult te beheren
    const [scanResult, setScanResult] = useState(null);
    // Gebruik useRef om een referentie naar de scanner te maken
    const scannerRef = useRef(null);

    // Gebruik useEffect om de scanner te initialiseren bij het mounten van de component
    useEffect(() => {
        initializeScanner();
    }, []);

    // Definieer de initializeScanner functie die de scanner initialiseert
    const initializeScanner = () => {
        // Controleer of de scanner al is geïnitialiseerd
        if (!scannerRef.current) {
            // Maak een nieuwe instance van Html5QrcodeScanner
            const scanner = new Html5QrcodeScanner('reader', {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 5,
            });

            // Render de scanner en sla de resultaten op
            scanner.render(success);
            scannerRef.current = scanner;
        }

        // Definieer de success functie die wordt aangeroepen bij succesvol scannen van een QR-code
        function success(result) {
            setScanResult(result);
        }

        // Verberg het info-icoon
        const infoIcon = document.querySelector('img[alt="Info icon"]');
        if (infoIcon) {
            infoIcon.style.display = 'none';
        }
    };

    // Definieer de handleScanAgain functie die de scanResult reset om de scanner opnieuw klaar te stellen
    const handleScanAgain = () => {
        setScanResult(null);
    };

    // Render de component
    return (
        <div className="qr-scanner">
            <h1>QR Scanner</h1>
            <div className="scanner-container" id="reader"></div>
            {scanResult? (
                <div className="scan-result">
                    <p>Resultaat: <br /> <a href={"http://" + scanResult}>{scanResult}</a></p>
                    <button className="button-opnieuw" onClick={handleScanAgain}>Opnieuw scannen</button>
                </div>
            ) : null}
            <NavigatiePlayer gameId={gameId} />
        </div>
    );
};

// Exporteer de component zodat deze kan worden gebruikt in andere bestanden
export default QRScannerPlayer;
