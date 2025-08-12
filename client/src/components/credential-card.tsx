import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CredentialCardProps {
  credential: any;
  onShare: (id: string) => void;
  onVerify: (id: string) => void;
}

export function CredentialCard({ credential, onShare, onVerify }: CredentialCardProps) {
  const getCredentialIcon = (type: string) => {
    switch (type) {
      case "student-id":
        return "fas fa-id-card";
      case "attendance":
        return "fas fa-calendar-check";
      case "transcript":
        return "fas fa-graduation-cap";
      case "certificate":
        return "fas fa-certificate";
      default:
        return "fas fa-file";
    }
  };

  const getCredentialColor = (type: string) => {
    switch (type) {
      case "student-id":
        return "from-primary to-primary-dark";
      case "attendance":
        return "from-secondary to-green-600";
      case "transcript":
        return "from-purple-600 to-purple-700";
      case "certificate":
        return "from-accent to-orange-600";
      default:
        return "from-neutral-600 to-neutral-700";
    }
  };

  const getCredentialTitle = (type: string) => {
    switch (type) {
      case "student-id":
        return "Student ID";
      case "attendance":
        return "Attendance Record";
      case "transcript":
        return "Academic Transcript";
      case "certificate":
        return "Certificate";
      default:
        return "Credential";
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className={`bg-gradient-to-r ${getCredentialColor(credential.type)} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{getCredentialTitle(credential.type)}</h3>
          <i className={getCredentialIcon(credential.type)}></i>
        </div>
        <p className="text-white/80 text-sm mt-1">
          {credential.data?.credentialSubject?.course || "Digital Credential"}
        </p>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Issued:</span>
            <span className="text-neutral-800">{formatDate(credential.issuedAt)}</span>
          </div>
          {credential.expiresAt && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Valid until:</span>
              <span className="text-neutral-800">{formatDate(credential.expiresAt)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Status:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <i className="fas fa-check-circle mr-1"></i>
              {credential.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onVerify(credential.id)}
          >
            <i className="fas fa-eye mr-1"></i>View
          </Button>
          <Button 
            size="sm" 
            className={`flex-1 ${getCredentialColor(credential.type).includes('primary') ? 'bg-primary hover:bg-primary-dark' : 
              getCredentialColor(credential.type).includes('secondary') ? 'bg-secondary hover:bg-green-600' :
              getCredentialColor(credential.type).includes('purple') ? 'bg-purple-600 hover:bg-purple-700' :
              'bg-accent hover:bg-orange-600'}`}
            onClick={() => onShare(credential.id)}
          >
            <i className="fas fa-share mr-1"></i>Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
