import React, { useState, useEffect, useRef } from 'react';
import Navigatie from '../navigatie/navigatie';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './qrscanner.css';

const QRScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const scannerRef = useRef(null);
     

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

        scanner.render(success);
        scannerRef.current = scanner;
    }

        function success(result) {
            setScanResult(result);
        }

        // Verberg het img-element met de alt-attribuutwaarde "Info icon"
        const infoIcon = document.querySelector('img[alt="Info icon"]');
        if (infoIcon) {
            infoIcon.style.display = 'none';
        }
    };

    // Reset scanResult zodat de scanner opnieuw klaarstaat
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
            <Navigatie />
        </div>
    );
};

export default QRScanner;



