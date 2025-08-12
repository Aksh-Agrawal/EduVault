import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CredentialCard } from "@/components/credential-card";
import { QrScanner } from "@/components/qr-scanner";
import { QrGenerator } from "@/components/qr-generator";
import type { Credential, AttendanceRecord } from "@shared/schema";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch user credentials
  const { data: credentials = [], isLoading: credentialsLoading } = useQuery<Credential[]>({
    queryKey: ["/api/credentials"],
    enabled: !!user,
  });

  // Fetch attendance records
  const { data: attendanceRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance"],
    enabled: !!user,
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async (data: { sessionId: string; subject: string; location: string }) => {
      const res = await apiRequest("POST", "/api/attendance", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Attendance marked",
        description: "Your attendance has been recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/credentials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Issue credential mutation (admin only)
  const issueCredentialMutation = useMutation({
    mutationFn: async (data: { studentId: string; type: string; data: any; expiresAt?: string }) => {
      const res = await apiRequest("POST", "/api/credentials/issue", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Credential issued",
        description: "The credential has been issued successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/credentials"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verify credential mutation
  const verifyCredentialMutation = useMutation({
    mutationFn: async (credentialId: string) => {
      const res = await apiRequest("POST", "/api/credentials/verify", { credentialId });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.valid ? "Valid Credential" : "Invalid Credential",
        description: data.message,
        variant: data.valid ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const handleMarkAttendance = async (qrData: string) => {
    try {
      const parsedData = JSON.parse(qrData);
      await markAttendanceMutation.mutateAsync({
        sessionId: parsedData.sessionId || "default-session",
        subject: parsedData.subject || "General",
        location: parsedData.location || "Campus",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid QR code format",
        variant: "destructive",
      });
    }
  };

  const getCredentialStats = () => {
    const totalCredentials = credentials.length;
    const attendancePercentage = attendanceRecords.length > 0 ? 
      Math.round((attendanceRecords.filter(r => r.timestamp).length / attendanceRecords.length) * 100) : 0;
    return { totalCredentials, attendancePercentage };
  };

  const { totalCredentials, attendancePercentage } = getCredentialStats();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-white text-sm"></i>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-neutral-800">ShikshaWallet</h1>
                <p className="text-xs text-neutral-500 hidden sm:block">Digital Student Identity</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => {}}>
                <i className="fas fa-bell"></i>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white rounded-lg p-1 shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-2">
              <i className="fas fa-th-large"></i>
              <span>Services</span>
            </TabsTrigger>
            <TabsTrigger value="credentials" className="flex items-center space-x-2">
              <i className="fas fa-id-card"></i>
              <span>Credentials</span>
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center space-x-2">
              <i className="fas fa-qrcode"></i>
              <span>Scan</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <i className="fas fa-cog"></i>
              <span>Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                      <i className="fas fa-user text-white text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold text-neutral-800">{user?.name}</h2>
                      <p className="text-neutral-500">Student ID: {user?.studentId}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-neutral-600">{user?.institution}</span>
                        <span className="mx-2 text-neutral-400">•</span>
                        <span className="text-sm text-neutral-600">{user?.course}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <i className="fas fa-check-circle mr-1"></i>Verified
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setActiveTab("scan")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <i className="fas fa-calendar-check text-primary"></i>
                    </div>
                    <i className="fas fa-arrow-right text-neutral-400 group-hover:text-primary transition-colors"></i>
                  </div>
                  <h3 className="font-medium text-neutral-800">Mark Attendance</h3>
                  <p className="text-sm text-neutral-500">Scan QR to check-in</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => window.open('/services', '_blank')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <i className="fas fa-credit-card text-secondary"></i>
                    </div>
                    <i className="fas fa-arrow-right text-neutral-400 group-hover:text-secondary transition-colors"></i>
                  </div>
                  <h3 className="font-medium text-neutral-800">Pay Fees</h3>
                  <p className="text-sm text-neutral-500">UPI payment gateway</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => window.open('/services', '_blank')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <i className="fas fa-book text-purple-600"></i>
                    </div>
                    <i className="fas fa-arrow-right text-neutral-400 group-hover:text-purple-600 transition-colors"></i>
                  </div>
                  <h3 className="font-medium text-neutral-800">Library Access</h3>
                  <p className="text-sm text-neutral-500">Check-in/out books</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => window.open('/services', '_blank')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <i className="fas fa-briefcase text-accent"></i>
                    </div>
                    <i className="fas fa-arrow-right text-neutral-400 group-hover:text-accent transition-colors"></i>
                  </div>
                  <h3 className="font-medium text-neutral-800">Opportunities</h3>
                  <p className="text-sm text-neutral-500">Jobs & internships</p>
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Total Credentials</p>
                      <p className="text-2xl font-bold text-neutral-900">{totalCredentials}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-id-card text-primary text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Attendance Rate</p>
                      <p className="text-2xl font-bold text-neutral-900">{attendancePercentage}%</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-calendar-check text-secondary text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Verification Status</p>
                      <p className="text-2xl font-bold text-green-600">Verified</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-shield-alt text-secondary text-lg"></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-neutral-800">Campus Services</h2>
                <p className="text-neutral-600">Quick access to university services</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => setActiveTab("scan")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                        <i className="fas fa-calendar-check text-blue-500 text-xl"></i>
                      </div>
                      <i className="fas fa-arrow-right text-neutral-400 group-hover:text-neutral-700 transition-colors"></i>
                    </div>
                    <div className="space-y-1 mt-3">
                      <h3 className="text-lg font-semibold text-neutral-800">Mark Attendance</h3>
                      <p className="text-sm text-neutral-500">Scan QR to check-in</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Fee payment feature will be available soon",
                    });
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                        <i className="fas fa-credit-card text-green-500 text-xl"></i>
                      </div>
                      <i className="fas fa-arrow-right text-neutral-400 group-hover:text-neutral-700 transition-colors"></i>
                    </div>
                    <div className="space-y-1 mt-3">
                      <h3 className="text-lg font-semibold text-neutral-800">Pay Fees</h3>
                      <p className="text-sm text-neutral-500">UPI payment gateway</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Library access feature will be available soon",
                    });
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                        <i className="fas fa-book text-purple-500 text-xl"></i>
                      </div>
                      <i className="fas fa-arrow-right text-neutral-400 group-hover:text-neutral-700 transition-colors"></i>
                    </div>
                    <div className="space-y-1 mt-3">
                      <h3 className="text-lg font-semibold text-neutral-800">Library Access</h3>
                      <p className="text-sm text-neutral-500">Check-in/out books</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Opportunities feature will be available soon",
                    });
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                        <i className="fas fa-briefcase text-orange-500 text-xl"></i>
                      </div>
                      <i className="fas fa-arrow-right text-neutral-400 group-hover:text-neutral-700 transition-colors"></i>
                    </div>
                    <div className="space-y-1 mt-3">
                      <h3 className="text-lg font-semibold text-neutral-800">Opportunities</h3>
                      <p className="text-sm text-neutral-500">Jobs & internships</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-neutral-500">
                  More services coming soon. Contact support for assistance.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="credentials" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">My Credentials</h2>
              <Button onClick={() => setActiveTab("admin")} disabled={!user?.isAdmin}>
                <i className="fas fa-plus mr-2"></i>Request New
              </Button>
            </div>

            {credentialsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-neutral-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : credentials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {credentials.map((credential: any) => (
                  <CredentialCard 
                    key={credential.id} 
                    credential={credential}
                    onShare={(id) => {
                      navigator.clipboard.writeText(id);
                      toast({
                        title: "Copied",
                        description: "Credential ID copied to clipboard",
                      });
                    }}
                    onVerify={(id) => verifyCredentialMutation.mutate(id)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="h-16 w-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-id-card text-neutral-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">No credentials yet</h3>
                  <p className="text-neutral-500">Your verified credentials will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scan" className="space-y-6">
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">QR Code Scanner</h2>
                <p className="text-neutral-600">Scan QR codes for attendance, verification, or access</p>
              </div>

              <QrScanner onScan={handleMarkAttendance} />

              <QrGenerator credentials={credentials} />
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            {!user?.isAdmin ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="h-16 w-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-lock text-red-500 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">Admin Access Required</h3>
                  <p className="text-neutral-500">You need admin privileges to access this section</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-neutral-800">Admin Panel</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <i className="fas fa-shield-alt mr-1"></i>Admin Access
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Issue Credential */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Issue New Credential</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form 
                        className="space-y-4" 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target as HTMLFormElement);
                          const data = {
                            studentId: formData.get("studentId") as string,
                            type: formData.get("type") as string,
                            data: JSON.parse(formData.get("data") as string),
                          };
                          issueCredentialMutation.mutate(data);
                        }}
                      >
                        <div>
                          <Label htmlFor="studentId">Student ID</Label>
                          <Input name="studentId" placeholder="Enter student ID" required />
                        </div>
                        
                        <div>
                          <Label htmlFor="type">Credential Type</Label>
                          <Select name="type" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select credential type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student-id">Student ID</SelectItem>
                              <SelectItem value="attendance">Attendance Record</SelectItem>
                              <SelectItem value="transcript">Academic Transcript</SelectItem>
                              <SelectItem value="certificate">Certificate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="data">Credential Data (JSON)</Label>
                          <Textarea 
                            name="data"
                            placeholder='{"name": "Student Name", "course": "BTech CSE", ...}'
                            className="font-mono text-sm h-32"
                            required
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={issueCredentialMutation.isPending}
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Issue Credential
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Verify Credential */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Verify Credential</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form 
                        className="space-y-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target as HTMLFormElement);
                          const credentialId = formData.get("credentialId") as string;
                          verifyCredentialMutation.mutate(credentialId);
                        }}
                      >
                        <div>
                          <Label htmlFor="credentialId">Credential ID</Label>
                          <Input 
                            name="credentialId"
                            placeholder="Enter credential ID or scan QR" 
                            required
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-secondary hover:bg-green-600" 
                          disabled={verifyCredentialMutation.isPending}
                        >
                          <i className="fas fa-check-circle mr-2"></i>
                          Verify Credential
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <p>&copy; 2024 ShikshaWallet. Powered by India Stack & W3C Standards.</p>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <i className="fas fa-shield-alt mr-1 text-secondary"></i>
                Blockchain Secured
              </span>
              <span className="flex items-center">
                <i className="fas fa-check-circle mr-1 text-secondary"></i>
                W3C Compliant
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
