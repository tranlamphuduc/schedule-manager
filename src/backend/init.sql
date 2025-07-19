-- Initialize database for Schedule Manager
-- This file is executed when the PostgreSQL container starts

-- Create database if not exists (this is handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS schedule_manager;

-- Set timezone
SET timezone = 'UTC';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Basic initialization complete
-- Tables will be created by Knex migrations
