import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface QrScannerProps {
  onScan: (data: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      setError("");
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const simulateQrScan = () => {
    // Simulate successful QR scan for demo
    const mockQrData = JSON.stringify({
      sessionId: "session-" + Date.now(),
      subject: "Data Structures Lab",
      location: "Computer Lab 1"
    });
    onScan(mockQrData);
    stopScanning();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
          {isScanning ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
              />
              <div className="absolute inset-4 border-2 border-primary rounded-lg opacity-50"></div>
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-primary rounded animate-pulse"></div>
              
              {/* Demo button for QR simulation */}
              <Button
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                onClick={simulateQrScan}
                size="sm"
              >
                Simulate QR Scan
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <i className="fas fa-camera text-4xl text-neutral-400 mb-2"></i>
              <p className="text-neutral-500">Camera view will appear here</p>
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
          )}
        </div>
        
        <Button 
          className="w-full" 
          onClick={isScanning ? stopScanning : startScanning}
        >
          <i className={`fas ${isScanning ? 'fa-stop' : 'fa-play'} mr-2`}></i>
          {isScanning ? "Stop Scanning" : "Start Scanning"}
        </Button>
      </CardContent>
    </Card>
  );
}
