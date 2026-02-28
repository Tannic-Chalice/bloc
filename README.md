# Smart Lead Assignment Automation 🚀

This repository contains an end-to-end automated lead assignment system built using Google Sheets, n8n automation, a Node.js backend, a frontend interface, and MongoDB.  
Whenever a new lead is added to Google Sheets, the system automatically evaluates the lead and assigns it to an eligible caller based on predefined smart assignment rules.

---

## 📁 Project Structure

root/
│
├── backend/     # Backend server (Node.js + MongoDB)
├── frontend/    # Frontend application
└── README.md

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

git clone <your-repository-url>  
cd <repository-name>

---

### 2️⃣ Frontend Setup

cd frontend  
npm install  
npm start

---

### 3️⃣ Backend Setup

cd backend  
npm install  
npm start

Ensure MongoDB is running locally or configure a MongoDB Atlas connection string in environment variables.

---

## 🖼️ Automation Workflow Screenshot

(Add n8n automation workflow screenshot here)

---

## 🧠 Development Logic Overview

The system automatically distributes incoming leads to callers in a fair and scalable manner.

- Any number of callers can be added
- Each caller has a daily assignment limit (default: 50)
- Leads are received through Google Sheets
- n8n automation triggers on every new row
- Smart assignment logic selects an eligible caller
- Data is stored and managed using MongoDB

---

## 🗄️ Database Structure (MongoDB – NoSQL)

### 📌 Leads Collection

Stores incoming lead information and assignment details.

Sample fields:
- name
- phone
- leadSource
- city, state
- status
- assignedCallerId
- timestamps

---

### 📌 Callers Collection

Stores caller profiles and workload limits.

Sample fields:
- name
- role
- languages
- assignedStates
- dailyLimit
- todayAssignedCount
- timestamps

---

## 🔄 How Automation Is Triggered

1. A new row is appended in Google Sheets  
2. n8n automation is triggered automatically  
3. Latest row data is fetched  
4. Data is sent to the backend API  
5. Backend assigns a caller and stores data in MongoDB  

---

## 🔗 External Resources

- Google Sheets Link: https://docs.google.com/spreadsheets/d/1W1wMPHSTZb5CTTiJvManJQzpa_oaaQ0FYtu8mRMs-1o/edit?usp=sharing
- Demo Video: https://drive.google.com/file/d/1lLNbmxPjddIXg7KMQaTijS2fdC-X-OiP/view?usp=sharing

---

## 🚀 Improvements With More Time

- Advanced lead scoring
- Admin dashboard
- Role-based access control
- Better error handling
- Notifications and analytics

---

## ✅ Conclusion

This project demonstrates a scalable, event-driven automation system that efficiently manages lead assignments using modern backend and automation tools.
