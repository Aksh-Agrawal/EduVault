import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QRCode from "qrcode";

interface QrGeneratorProps {
  credentials: any[];
}

export function QrGenerator({ credentials }: QrGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const generateQrCode = async (data: any) => {
    setGenerating(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
        width: 256,
        margin: 2,
        color: {
          dark: '#1976D2', // Primary color from design
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    } finally {
      setGenerating(false);
    }
  };

  const generateStudentIdQR = () => {
    const studentCredential = credentials.find(c => c.type === "student-id");
    if (studentCredential) {
      generateQrCode({
        type: "credential_verification",
        credentialId: studentCredential.id,
        credentialType: "student-id",
        verificationUrl: `${window.location.origin}/verify/${studentCredential.id}`
      });
    } else {
      generateQrCode({
        type: "error",
        message: "No student ID credential found",
        action: "Please request a student ID credential from your institution"
      });
    }
  };

  const generateTranscriptQR = () => {
    const transcriptCredential = credentials.find(c => c.type === "transcript");
    if (transcriptCredential) {
      generateQrCode({
        type: "credential_verification",
        credentialId: transcriptCredential.id,
        credentialType: "transcript",
        verificationUrl: `${window.location.origin}/verify/${transcriptCredential.id}`
      });
    } else {
      generateQrCode({
        type: "error",
        message: "No transcript credential found",
        action: "Academic transcripts will be available after semester completion"
      });
    }
  };

  const generateAllCredentialsQR = () => {
    if (credentials.length === 0) {
      generateQrCode({
        type: "error",
        message: "No credentials available",
        action: "Contact your institution to issue credentials"
      });
      return;
    }

    generateQrCode({
      type: "credential_bundle_verification",
      studentId: credentials[0]?.studentId,
      credentials: credentials.map(c => ({
        id: c.id,
        type: c.type,
        issuedAt: c.issuedAt,
        isActive: c.isActive
      })),
      verificationUrl: `${window.location.origin}/verify/bundle`,
      totalCredentials: credentials.length
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-neutral-800">Share My Credentials</CardTitle>
      </CardHeader>
      <CardContent>
        {/* QR Code Display */}
        <div className="aspect-square bg-neutral-50 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-neutral-200">
          {generating ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-neutral-500 text-sm">Generating QR code...</p>
            </div>
          ) : qrCodeUrl ? (
            <div className="p-4">
              <img 
                src={qrCodeUrl} 
                alt="Generated QR Code" 
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>
          ) : (
            <div className="text-center">
              <i className="fas fa-qrcode text-4xl text-neutral-400 mb-2"></i>
              <p className="text-neutral-500 text-sm">QR code will be generated here</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-secondary text-white hover:bg-green-600 transition-colors"
            onClick={generateStudentIdQR}
            disabled={generating}
          >
            <i className="fas fa-id-card mr-2"></i>Student ID QR
          </Button>
          
          <Button
            className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            onClick={generateTranscriptQR}
            disabled={generating}
          >
            <i className="fas fa-graduation-cap mr-2"></i>Transcript QR
          </Button>
          
          <Button
            className="w-full bg-neutral-600 text-white hover:bg-neutral-700 transition-colors"
            onClick={generateAllCredentialsQR}
            disabled={generating}
          >
            <i className="fas fa-layer-group mr-2"></i>All Credentials QR
          </Button>
        </div>

        {qrCodeUrl && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center text-sm text-blue-800">
              <i className="fas fa-info-circle mr-2"></i>
              <span>QR code generated successfully. Share this with verifiers to authenticate your credentials.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
