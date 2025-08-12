import { type User, type InsertUser, type Credential, type InsertCredential, type AttendanceRecord, type InsertAttendanceRecord, type VerificationLog, type InsertVerificationLog } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Credential methods
  getCredential(id: string): Promise<Credential | undefined>;
  getCredentialsByStudentId(studentId: string): Promise<Credential[]>;
  createCredential(credential: InsertCredential): Promise<Credential>;
  updateCredential(id: string, updates: Partial<Credential>): Promise<Credential | undefined>;
  
  // Attendance methods
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  getAttendanceByStudentId(studentId: string): Promise<AttendanceRecord[]>;
  
  // Verification methods
  createVerificationLog(log: InsertVerificationLog): Promise<VerificationLog>;
  getVerificationLogs(): Promise<VerificationLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private credentials: Map<string, Credential>;
  private attendanceRecords: Map<string, AttendanceRecord>;
  private verificationLogs: Map<string, VerificationLog>;

  constructor() {
    this.users = new Map();
    this.credentials = new Map();
    this.attendanceRecords = new Map();
    this.verificationLogs = new Map();
    
    // Create default admin user
    this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      password: adminPasswordHash,
      name: "System Administrator",
      studentId: null,
      institution: "CSVTU",
      course: null,
      year: null,
      email: "admin@csvtu.ac.in",
      phone: null,
      isAdmin: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create default student
    const studentPasswordHash = await bcrypt.hash("student123", 10);
    const studentUser: User = {
      id: randomUUID(),
      username: "2024CSE001",
      password: studentPasswordHash,
      name: "Aksh Agrawal",
      studentId: "2024CSE001",
      institution: "Chhattisgarh Swami Vivekanand Technical University",
      course: "BTech CSE (Data Science)",
      year: "2",
      email: "aksh@csvtu.ac.in",
      phone: "+91-9876543210",
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(studentUser.id, studentUser);

    // Create some demo credentials for the student
    const studentCredential: Credential = {
      id: randomUUID(),
      studentId: studentUser.id,
      type: "student_id",
      data: {
        name: studentUser.name,
        studentId: studentUser.studentId,
        course: studentUser.course,
        year: studentUser.year,
        institution: studentUser.institution,
        validFrom: new Date().toISOString(),
        issuer: "CSVTU"
      },
      signature: "demo_signature",
      issuerId: adminUser.id,
      issuedAt: new Date(),
      expiresAt: null,
      isActive: true,
    };
    this.credentials.set(studentCredential.id, studentCredential);

    const attendanceCredential: Credential = {
      id: randomUUID(),
      studentId: studentUser.id,
      type: "attendance",
      data: {
        subject: "Data Structures & Algorithms",
        date: new Date().toISOString(),
        status: "Present",
        location: "Room 301",
        session: "Morning"
      },
      signature: "demo_signature_2",
      issuerId: adminUser.id,
      issuedAt: new Date(),
      expiresAt: null,
      isActive: true,
    };
    this.credentials.set(attendanceCredential.id, attendanceCredential);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      email: insertUser.email || null,
      studentId: insertUser.studentId || null,
      institution: insertUser.institution || null,
      course: insertUser.course || null,
      year: insertUser.year || null,
      phone: insertUser.phone || null,
      isAdmin: insertUser.isAdmin || false,
    };
    this.users.set(id, user);
    return user;
  }

  async getCredential(id: string): Promise<Credential | undefined> {
    return this.credentials.get(id);
  }

  async getCredentialsByStudentId(studentId: string): Promise<Credential[]> {
    return Array.from(this.credentials.values()).filter(
      (credential) => credential.studentId === studentId && credential.isActive,
    );
  }

  async createCredential(insertCredential: InsertCredential): Promise<Credential> {
    const id = randomUUID();
    const credential: Credential = {
      ...insertCredential,
      id,
      issuedAt: new Date(),
      isActive: true,
      expiresAt: insertCredential.expiresAt || null,
    };
    this.credentials.set(id, credential);
    return credential;
  }

  async updateCredential(id: string, updates: Partial<Credential>): Promise<Credential | undefined> {
    const credential = this.credentials.get(id);
    if (!credential) return undefined;
    
    const updatedCredential = { ...credential, ...updates };
    this.credentials.set(id, updatedCredential);
    return updatedCredential;
  }

  async createAttendanceRecord(insertRecord: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const id = randomUUID();
    const record: AttendanceRecord = {
      ...insertRecord,
      id,
      timestamp: new Date(),
      subject: insertRecord.subject || null,
      location: insertRecord.location || null,
      credentialId: insertRecord.credentialId || null,
    };
    this.attendanceRecords.set(id, record);
    return record;
  }

  async getAttendanceByStudentId(studentId: string): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values()).filter(
      (record) => record.studentId === studentId,
    );
  }

  async createVerificationLog(insertLog: InsertVerificationLog): Promise<VerificationLog> {
    const id = randomUUID();
    const log: VerificationLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
      verifierId: insertLog.verifierId || null,
      details: insertLog.details || null,
    };
    this.verificationLogs.set(id, log);
    return log;
  }

  async getVerificationLogs(): Promise<VerificationLog[]> {
    return Array.from(this.verificationLogs.values());
  }
}

export const storage = new MemStorage();
