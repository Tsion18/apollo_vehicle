DROP DATABASE IF EXISTS apollo;

CREATE DATABASE apollo;
\c apollo

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE vehicle (
  vin CITEXT PRIMARY KEY DEFAULT (substring(md5(random()::text || clock_timestamp()::text) from 1 for 17)),
  manufacturer_name VARCHAR(100) NOT NULL,
  description TEXT,
  horsepower INT NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  model_year INT NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  fuel_type VARCHAR(50) NOT NULL
);