# BiteSpeed Backend Task – Identity Reconciliation API

This project implements a RESTful API that identifies and links customer contact information (email and/or phone number) based on historical data. It helps maintain clean, deduplicated contact records by managing primary and secondary identities.

---

## 🛠 Tech Stack

- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- Hosted on [Render](https://render.com)
- Deployed: [Live API Endpoint](https://bitespeed-j789.onrender.com/identify)

---

## 📌 API Endpoint

### `POST /identify`

Identifies and links user contacts based on incoming email or phone number.

#### 🔸 Request

- **URL**: `https://bitespeed-j789.onrender.com/identify`
- **Method**: `POST`
- **Headers**:  
  `Content-Type: application/json`
- **Body** (`JSON`):
```json
{
  "email": "john@example.com",
  "phoneNumber": "1234567890"
}
