import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  studentId: text("student_id"),
  institution: text("institution"),
  course: text("course"),
  year: text("year"),
  email: text("email"),
  phone: text("phone"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const credentials = pgTable("credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: text("student_id").notNull(),
  type: text("type").notNull(), // student-id, attendance, transcript, certificate
  data: jsonb("data").notNull(), // W3C Verifiable Credential JSON
  signature: text("signature").notNull(), // JWT signature
  issuerId: text("issuer_id").notNull(),
  issuedAt: timestamp("issued_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
});

export const attendanceRecords = pgTable("attendance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: text("student_id").notNull(),
  sessionId: text("session_id").notNull(),
  subject: text("subject"),
  location: text("location"),
  timestamp: timestamp("timestamp").defaultNow(),
  credentialId: text("credential_id"),
});

export const verificationLogs = pgTable("verification_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  credentialId: text("credential_id").notNull(),
  verifierId: text("verifier_id"),
  verificationResult: boolean("verification_result").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  details: jsonb("details"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCredentialSchema = createInsertSchema(credentials).omit({
  id: true,
  issuedAt: true,
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
  timestamp: true,
});

export const insertVerificationLogSchema = createInsertSchema(verificationLogs).omit({
  id: true,
  timestamp: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Credential verification schema
export const verifyCredentialSchema = z.object({
  credentialId: z.string().min(1, "Credential ID is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Credential = typeof credentials.$inferSelect;
export type InsertCredential = z.infer<typeof insertCredentialSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;
export type VerificationLog = typeof verificationLogs.$inferSelect;
export type InsertVerificationLog = z.infer<typeof insertVerificationLogSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type VerifyCredentialRequest = z.infer<typeof verifyCredentialSchema>;
