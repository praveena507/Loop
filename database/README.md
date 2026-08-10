# LOOP Database Directory

This directory contains the database schema definitions, seeding scripts, and Supabase database utilities for the **LOOP Platform**.

## Files Overview

- **`schema.sql`**: Full SQL DDL schema definitions for Supabase / PostgreSQL / SQLite database tables.
- **`initDb.js`**: Database initialization module with Supabase JS Client integration.
- **`seed.js`**: Seed script for populating initial default staff accounts (`admin@loop.com` & `analyst@loop.com`) and sample complaints.
- **`test_integration.js`**: End-to-end integration test runner verifying complaint submission, OTP verification, Gemini AI analysis, analyst actions, status history, and customer tracking privacy.

## Supabase Tables

1. `complaints`
2. `complaint_ai_analysis`
3. `complaint_status_history`
4. `complaint_themes`
5. `analyst_actions`
6. `responses`
7. `email_verifications`
8. `password_reset_tokens`
9. `notifications`
10. `audit_logs`
