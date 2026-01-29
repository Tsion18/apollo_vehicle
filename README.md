# Vehicle Service API

This project is a simple RESTful web service that provides CRUD-style API access to vehicle data stored in a PostgreSQL database. 

## Table of Contents

* [Features](#features)
* [Setup Instructions](#setup-instructions)
* [API Endpoints](#api-endpoints)
* [Error Handling](#error-handling)
* [Testing](#testing)
* [Architecture Overview](#architecture-overview)

## Features

* **CRUD Operations**: Create, read, update, and delete vehicle records.
* **VIN Auto-Generation**: VINs are generated automatically by the database.
* **Validation**: Ensures all required fields are present and correctly typed.
* **Error Handling**: Gracefully handles malformed JSON, validation errors, and missing resources.
* **Automated Testing**: End-to-end component tests using PyTest.
* **PostgreSQL Integration**: Persistent storage with schema constraints.

## Setup Instructions

### 1. Clone the Repository
```bash
git clone 
cd Apollo
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Configure Environment

Update the existing `env.json` file with your PostgreSQL credentials:
```json
{
  "user": "your_username",
  "host": "localhost",
  "database": "apollo",
  "password": "your_password",
  "port": 5432
}
```

### 4. Setup the Database

Recreate the database and schema by running:
```bash
npm run setup
```

### 5. Start the Server
```bash
npm start
```

The service will run at:
```
http://localhost:3000
```

## API Endpoints

### 1. Get All Vehicles

**Endpoint**: `GET /vehicle`

**Response**: Returns a JSON array of all vehicles.

### 2. Get Vehicle by VIN

**Endpoint**: `GET /vehicle/:vin`

**Response**: Returns the vehicle with the specified VIN.

### 3. Create a Vehicle

**Endpoint**: `POST /vehicle`

**Request Body**:
```json
{
  "manufacturer_name": "Rimac",
  "description": "Electric hypercar",
  "horsepower": 1914,
  "model_name": "Nevera",
  "model_year": 2023,
  "purchase_price": 2400000,
  "fuel_type": "Electric"
}
```

**Response**: Returns the newly created vehicle, including its generated VIN.

### 4. Update a Vehicle

**Endpoint**: `PUT /vehicle/:vin`

**Request Body**: Same format as `POST /vehicle`

**Response**: Returns the updated vehicle.

### 5. Delete a Vehicle

**Endpoint**: `DELETE /vehicle/:vin`

**Response**: Returns HTTP `204 No Content` on success.

## Error Handling

* **400 Bad Request** - Returned when the server cannot parse malformed JSON.
* **422 Unprocessable Entity** - Returned when the request JSON is valid but fails validation rules.
* **404 Not Found** - Returned when a vehicle with the specified VIN does not exist.
* **500 Internal Server Error** - Returned for unexpected server or database errors.

## Testing

Tests are written in Python using PyTest and exercise the API end-to-end.

### Install Python Dependencies
```bash
python3 -m pip install -r requirements.txt
```

### Run Tests
```bash
npm run test
```

The test suite covers:
* Successful CRUD operations
* Validation errors
* Missing resources
* Malformed JSON payloads

## Architecture Overview

* **Backend**: Node.js with Express
* **Database**: PostgreSQL
* **API Style**: REST
* **Testing**: PyTest with HTTP requests against a running server
* **Build & Run**: Fully command-line based

