import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import guardApi from '../api/guardApi';
import '../styles/GuardScanner.css';

export default function GuardScanner() {
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [cameraMode, setCameraMode] = useState(false);
  const scannerRef = useRef(null);
  const qrScannerRef = useRef(null);

  useEffect(() => {
    // Cleanup scanner on unmount
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.clear().catch(err => console.error('Scanner cleanup error:', err));
      }
    };
  }, []);

  const startCameraScanner = () => {
    setCameraMode(true);
    setError('');
    setResult(null);

    // Initialize scanner after DOM update
    setTimeout(() => {
      if (scannerRef.current && !qrScannerRef.current) {
        qrScannerRef.current = new Html5QrcodeScanner(
          'qr-reader',
          { 
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          false
        );

        qrScannerRef.current.render(onScanSuccess, onScanError);
      }
    }, 100);
  };

  const stopCameraScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.clear().then(() => {
        qrScannerRef.current = null;
        setCameraMode(false);
      }).catch(err => {
        console.error('Error stopping scanner:', err);
        setCameraMode(false);
      });
    } else {
      setCameraMode(false);
    }
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    console.log('QR Code scanned:', decodedText);
    setQrInput(decodedText);
    stopCameraScanner();
    // Auto-verify
    verifyQRCode(decodedText);
  };

  const onScanError = (errorMessage) => {
    // Ignore frequent scanning errors
    if (!errorMessage.includes('NotFoundException')) {
      console.warn('QR scan error:', errorMessage);
    }
  };

  const verifyQRCode = async (qrData) => {
    setScanning(true);
    setError('');
    setResult(null);

    try {
      const response = await guardApi.verifyQR(qrData);
      setResult(response);
      
      // Auto-clear after 5 seconds if successful
      if (response.success) {
        setTimeout(() => {
          setQrInput('');
          setResult(null);
        }, 5000);
      }
    } catch (err) {
      const errorData = err.response?.data || {};
      setResult(errorData);
      setError(errorData.message || 'Verification failed');
    } finally {
      setScanning(false);
    }
  };

  const handleScanQR = () => {
    if (!qrInput.trim()) {
      setError('Please enter QR data');
      return;
    }
    verifyQRCode(qrInput);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScanQR();
    }
  };

  const getResultClass = () => {
    if (!result) return '';
    return result.success ? 'result-success' : 'result-deny';
  };

  const getActionIcon = () => {
    if (!result) return '';
    return result.action === 'GRANT' ? '✅' : '❌';
  };

  return (
    <div className="guard-scanner-container">
      <div className="scanner-header">
        <h1>🛡️ Temple Entry Scanner</h1>
        <p>Scan visitor QR codes for entry verification</p>
      </div>

      <div className="scanner-content">
        {/* Camera Scanner Mode */}
        {cameraMode ? (
          <div className="camera-scanner-section">
            <div className="scanner-header-controls">
              <h2>📸 Camera Scanner Active</h2>
              <button onClick={stopCameraScanner} className="btn-stop-camera">
                ❌ Stop Camera
              </button>
            </div>
            <div id="qr-reader" ref={scannerRef}></div>
            <div className="camera-instructions">
              <p>📱 Point your camera at the visitor's QR code</p>
              <p>The system will automatically verify when detected</p>
            </div>
          </div>
        ) : (
          <>
            {/* Manual Input Section */}
            <div className="scanner-input-section">
              <div className="input-mode-toggle">
                <button 
                  onClick={startCameraScanner}
                  className="btn-camera-mode"
                >
                  📸 Scan with Camera
                </button>
              </div>

              <div className="manual-input-area">
                <label htmlFor="qr-input">Or Enter QR Data Manually:</label>
                <textarea
                  id="qr-input"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Paste QR data here...'
                  rows={6}
                  disabled={scanning}
                />
                
                <button 
                  onClick={handleScanQR}
                  disabled={scanning || !qrInput.trim()}
                  className="btn-scan"
                >
                  {scanning ? '🔄 Verifying...' : '🔍 Verify Entry'}
                </button>
              </div>

              <div className="scanner-instructions">
                <h3>📋 How to Use:</h3>
                <ol>
                  <li>Click "Scan with Camera" for instant scanning</li>
                  <li>OR paste QR data manually and click verify</li>
                  <li>Grant or deny entry based on the result</li>
                </ol>
              </div>
            </div>
          </>
        )}

        {result && (
          <div className={`verification-result ${getResultClass()}`}>
            <div className="result-icon">{getActionIcon()}</div>
            
            <h2>{result.action === 'GRANT' ? 'ENTRY GRANTED' : 'ENTRY DENIED'}</h2>
            <p className="result-message">{result.message}</p>

            {result.success && result.visitor && (
              <div className="visitor-details">
                <div className="visitor-header">
                  <h3>Visitor Information:</h3>
                  <div className="visitor-name-display">
                    👤 {result.visitor.name}
                  </div>
                </div>
                <div className="detail-grid">
                  {result.visitor.profileImage && (
                    <div className="visitor-photo">
                      <img src={result.visitor.profileImage} alt={result.visitor.name} />
                    </div>
                  )}
                  <div className="visitor-info">
                    <p><strong>Name:</strong> {result.visitor.name}</p>
                    <p><strong>Email:</strong> {result.visitor.email}</p>
                    <p><strong>Phone:</strong> {result.visitor.phone}</p>
                  </div>
                </div>

                <h3>Booking Details:</h3>
                <div className="booking-info">
                  <p><strong>Token:</strong> {result.booking.tokenNumber}</p>
                  <p><strong>Temple:</strong> {result.booking.temple}</p>
                  <p><strong>Time Slot:</strong> {result.booking.timeSlot}</p>
                  <p><strong>Visitors:</strong> {result.booking.numberOfVisitors}</p>
                </div>
              </div>
            )}

            {!result.success && result.entryWindow && (
              <div className="entry-info">
                <p><strong>Entry Window:</strong> {result.entryWindow}</p>
                {result.currentTime && (
                  <p><strong>Current Time:</strong> {result.currentTime}</p>
                )}
              </div>
            )}

            {!result.success && result.bookingDate && (
              <div className="entry-info">
                <p><strong>Booking Date:</strong> {result.bookingDate}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="scanner-footer">
        <p>🔐 Secure Entry Management System</p>
      </div>
    </div>
  );
}
