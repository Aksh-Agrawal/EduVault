import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginSchema, verifyCredentialSchema, insertCredentialSchema, insertAttendanceRecordSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "shiksha-wallet-secret-key";

interface AuthenticatedRequest extends Express.Request {
  user?: any;
}

// Middleware for JWT authentication
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Middleware for admin authentication
function requireAdmin(req: any, res: any, next: any) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// Generate W3C Verifiable Credential
function generateVerifiableCredential(credentialData: any, issuer: string, credentialType: string) {
  const credential = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "id": `urn:uuid:${crypto.randomUUID()}`,
    "type": ["VerifiableCredential", credentialType],
    "issuer": issuer,
    "issuanceDate": new Date().toISOString(),
    "credentialSubject": credentialData,
    "proof": {
      "type": "JwtProof2020",
      "created": new Date().toISOString(),
      "proofPurpose": "assertionMethod",
      "verificationMethod": `${issuer}/keys/1`,
    }
  };
  
  return credential;
}

// Sign credential with JWT
function signCredential(credential: any): string {
  return jwt.sign(credential, JWT_SECRET, { expiresIn: '10y' });
}

// Verify credential signature
function verifyCredentialSignature(signature: string): any {
  try {
    return jwt.verify(signature, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          isAdmin: user.isAdmin 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id,
          username: user.username,
          name: user.name,
          studentId: user.studentId,
          institution: user.institution,
          course: user.course,
          year: user.year,
          email: user.email,
          phone: user.phone,
          isAdmin: user.isAdmin
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        isAdmin: false,
      });

      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          isAdmin: user.isAdmin 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.status(201).json({ 
        token, 
        user: { 
          id: user.id,
          username: user.username,
          name: user.name,
          studentId: user.studentId,
          institution: user.institution,
          course: user.course,
          year: user.year,
          email: user.email,
          phone: user.phone,
          isAdmin: user.isAdmin
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        studentId: user.studentId,
        institution: user.institution,
        course: user.course,
        year: user.year,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Credential routes
  app.get("/api/credentials", authenticateToken, async (req: any, res) => {
    try {
      const credentials = await storage.getCredentialsByStudentId(req.user.username);
      res.json(credentials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credentials" });
    }
  });

  app.post("/api/credentials/issue", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { studentId, type, data, expiresAt } = req.body;
      
      // Generate W3C Verifiable Credential
      const credential = generateVerifiableCredential(
        data,
        "https://csvtu.ac.in/registrar",
        type
      );

      // Sign the credential
      const signature = signCredential(credential);

      const newCredential = await storage.createCredential({
        studentId,
        type,
        data: credential,
        signature,
        issuerId: req.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      res.status(201).json(newCredential);
    } catch (error) {
      res.status(400).json({ message: "Failed to issue credential" });
    }
  });

  app.post("/api/credentials/verify", async (req, res) => {
    try {
      const { credentialId } = verifyCredentialSchema.parse(req.body);
      
      const credential = await storage.getCredential(credentialId);
      if (!credential) {
        return res.status(404).json({ 
          valid: false, 
          message: "Credential not found" 
        });
      }

      // Verify signature
      const verifiedData = verifyCredentialSignature(credential.signature);
      if (!verifiedData) {
        await storage.createVerificationLog({
          credentialId,
          verifierId: "system",
          verificationResult: false,
          details: { reason: "Invalid signature" },
        });

        return res.json({ 
          valid: false, 
          message: "Invalid credential signature" 
        });
      }

      // Check if credential is active and not expired
      const isValid = Boolean(credential.isActive) && 
                     (!credential.expiresAt || credential.expiresAt > new Date());

      await storage.createVerificationLog({
        credentialId,
        verifierId: "system",
        verificationResult: isValid,
        details: { 
          credentialType: credential.type,
          issuedAt: credential.issuedAt,
          expiresAt: credential.expiresAt,
        },
      });

      res.json({ 
        valid: isValid,
        credential: isValid ? credential : null,
        message: isValid ? "Credential is valid" : "Credential is expired or inactive"
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Attendance routes
  app.post("/api/attendance", authenticateToken, async (req: any, res) => {
    try {
      const { sessionId, subject, location } = req.body;
      
      const record = await storage.createAttendanceRecord({
        studentId: req.user.username,
        sessionId,
        subject,
        location,
      });

      // Generate attendance credential
      const attendanceData = {
        studentId: req.user.username,
        sessionId,
        subject,
        location,
        timestamp: record.timestamp,
      };

      const credential = generateVerifiableCredential(
        attendanceData,
        "https://csvtu.ac.in/attendance",
        "AttendanceCredential"
      );

      const signature = signCredential(credential);

      const attendanceCredential = await storage.createCredential({
        studentId: req.user.username,
        type: "attendance",
        data: credential,
        signature,
        issuerId: "system",
        expiresAt: null,
      });

      res.status(201).json({ record, credential: attendanceCredential });
    } catch (error) {
      res.status(400).json({ message: "Failed to mark attendance" });
    }
  });

  app.get("/api/attendance", authenticateToken, async (req: any, res) => {
    try {
      const records = await storage.getAttendanceByStudentId(req.user.username);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  // Admin routes
  app.get("/api/admin/verifications", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const logs = await storage.getVerificationLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch verification logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
