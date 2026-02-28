# Smart Lead Assignment Automation 🚀

This repository contains an end-to-end automated lead assignment system built using Google Sheets, n8n automation, a Node.js backend, a frontend interface, and MongoDB.  
Whenever a new lead is added to Google Sheets, the system automatically evaluates the lead and assigns it to an eligible caller based on predefined smart assignment rules.

---

## 📁 Project Structure

```text
root/
│
├── backend/     # Backend server (Node.js + MongoDB)
├── frontend/    # Frontend application
└── README.md
```
---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```text
git clone https://github.com/Tannic-Chalice/bloc.git  
cd bloc
```
---

### 2️⃣ Frontend Setup

```text
cd frontend  
npm install  
npm start
```
---

### 3️⃣ Backend Setup

```text
cd backend  
npm install  
npm start
```

Ensure MongoDB is running locally or configure a MongoDB Atlas connection string in environment variables.

---

## 🖼️ Automation Workflow Screenshot

<img width="1919" height="875" alt="image" src="https://github.com/user-attachments/assets/5fbd38b2-5eaf-4ae2-9038-2fa8ee890f1f" />


---

## 🧠 Development Logic Overview

The core objective of this system is to automatically distribute incoming leads to sales callers in a **fair, scalable, and rule-based manner**.

Leads are assigned using a **Round Robin–based smart assignment logic**, ensuring equal distribution while respecting caller constraints such as state mapping and daily lead limits.

### High-Level Flow
- Leads are added to Google Sheets
- n8n automation detects new rows in real time
- Lead data is forwarded to the backend API
- Backend applies Round Robin assignment logic
- Assigned leads and caller workloads are stored in MongoDB

---

## 🔁 Smart Lead Assignment Logic (Round Robin)

Every incoming lead is automatically assigned to a sales caller using a **Round Robin strategy**, as defined in the assignment requirements.

### 1️⃣ State-Based Assignment
- If a lead belongs to a specific state, it is first matched with callers assigned to that state
- If multiple callers are eligible for the same state, **Round Robin** is applied among them
- If no caller is mapped to the lead’s state, the system falls back to a **global Round Robin** across all callers

> Assigned states also imply regional language capability.

---

### 2️⃣ Daily Lead Cap Enforcement
- Each caller has a configurable **daily lead limit** (default: 50 leads/day)
- Once a caller reaches their daily cap, they are skipped automatically
- The system continues Round Robin among remaining eligible callers

---

### 3️⃣ Round Robin Distribution
- Leads are distributed sequentially across eligible callers
- The assignment pointer updates dynamically after each assignment
- The logic ensures fairness even when callers hit daily limits

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
