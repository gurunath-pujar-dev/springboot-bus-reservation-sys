## Bus Reservation System

The Bus Reservation System is a full-stack web application designed to allow users to search for, book, and manage bus reservations. The system consists of a Backend API powered by Spring Boot for handling multiple services and database interactions, an API Gateway for routing requests, a ReactJS frontend for the user interface, and MySQL as the relational database to store reservation data.

## Features 

User Registration and Authentication: Allows users to register, log in, and securely manage their accounts.

Bus Search and Filtering: Users can search for buses based on departure, arrival, and schedule.

Booking and Cancellation: Users can book, view, and cancel their reservations.

Admin Panel: Admin users can manage buses, schedules, and reservations.

Real-Time Availability: The system shows real-time bus availability.

## Tech Stack

Backend: JAVA - Spring Boot

Frontend: ReactJS 

Database: MySQL

Authentication: JSON Web Token

## Prerequisites 

Java (JDK 21)

Node.js and npm

MySQL (with a database set up for the application)

Maven (for building and running the Spring Boot project)

## Setup 

### Backend Setup (Spring Boot) 

Clone the repository:

```bash
git clone https://github.com/gurunath-pujar-dev/springboot-bus-reservation-sys.git
cd bus-reservation-system
```
Set up your MySQL database. Update the application.properties file with your MySQL credentials:
```bash
spring.datasource.url=jdbc:mysql://localhost:3306/bus_reservation_db
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
```
Run the services and API-gateway.
The backend should be running on http://localhost:8080

### Frontend Setup (ReactJS) :
```bash
cd frontend 
npm install 
npm start
```
The frontend should be running on http://localhost:3000
