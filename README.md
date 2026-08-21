# Online Counseling Platform — Frontend
- A React app that connects clients with licensed counselors for mental health, relationship, and career counseling — through video calls, chat, email, and secure online payment.

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js, Express.js 
- Database: MongoDB
- Video Calls: Jitsi Meet 
- Payments: Razorpay
- Real-time Chat: Socket.io
- Emails: Brevo API 


## App Flow 

1. Sign Up
- A person registers as either a Client or a Counselor.

2. Counselor sets up profile
- The counselor fills in their bio, area of expertise, session types (Mental Health / Relationship / Career), price per session, and available time slots.

3. Client browses counselors
- The client sees a list of all counselors on the Home page and picks one.

4. Client books an appointment
- The client selects a session type and an available time slot, then pays online using Razorpay.

5. Payment is verified
Once payment succeeds:
- The appointment is marked as confirmed
- A  video call link is automatically generated for that appointment
- A confirmation email is sent to the client 

6. Session day — Video Call
- Both the client and counselor click Join Video Call, which opens the same videocall Meet link in a new tab — no login, no app install needed.
7. Chat
- Client and counselor can also chat with each other in real time from their dashboards. Messages are saved to the database, so the chat history stays even after refreshing the page.

8. Email (outside the session)
- From inside the Chat page, either person can click  Email to send a real email directly to the other person's inbox  useful for messages outside of a live session. This also goes through Brevo.

9. Session Notes
- After the session, the counselor writes notes about the session and can attach a file. Only that specific client and counselor can see these notes enforced on the server side

10. Client Records
- The counselor has a page that shows every client they've worked with, along with that client's full session history.

11. Dashboard
- Client Dashboard: shows all their appointments, status, and payment status
- Counselor Dashboard: shows all appointments, lets them confirm/cancel sessions, and edit their profile

