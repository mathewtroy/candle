# 🕯️ Candly App |	React, Firebase, Cloudinary

**Author:** Aleksandr Kross <br>
**GitHub:** https://github.com/mathewtroy/candle <br>
**Website:** https://candly-krossi.web.app <br>
:email: **[For questions, reach out here](mailto:krossale@fel.czut.cz)**

## 📖 Project Description
Candly is a social web application where users can 'light candles' - share short posts of inspiration or support. Other users can show appreciation by lighting a candle (like). Each user has their own profile page, and an admin panel allows moderation.

## 🎯 Project Idea
Each user has a personal wall with their own posts. They can:
- Register and log in (Firebase Authentication)
- Create posts
- Like posts from others (light a candle)
- Search for other users
- Access the admin panel if they have the admin role

## ⚙️ Technologies

| **Category** | **Technologies** |
|---------------|------------------|
| **Frontend** | React 19, React Router DOM v7 |
| **Backend / Database** | Firebase Authentication, Cloud Firestore |
| **Storage & Media** | Cloudinary (avatar upload & compression) |
| **UI / Styling** | CSS + animate.css |
| **Hosting** | Firebase Hosting |
| **Dev Tools** | ESLint, npm, GitHub |

## 🧩 Project Structure of CANDLY

**public/**		   Public assets (favicon, manifest) <br>
**src/**		     Source directory <br>
**assets/**	     Icons and images <br>
**components/**	 Reusable React components <br>
**context/**	   Global Context (Auth) <br>
**firebase/**	   Firebase initialization <br>
**hooks/**		   Custom React hooks <br>
**layouts/**	   Layout templates <br>
**pages/**		   Main pages (Home, Profile, Admin) <br>
**styles/**		   CSS files <br>
**App.jsx**		   Router and app entry <br>
**index.js**		 ReactDOM entry <br>
**Index.css**	   main CSS <br>
**.env**		         Firebase and Cloudinary keys <br>
**firebase.json**	   Firebase Hosting config <br>
**firestore.rules**	 Firestore security rules <br>
**package.json**	   Dependencies <br>
**README.md**        Documentation

## 🚀 How to Run the Project
1️⃣ **Clone the repository:** <br>
`git clone https://github.com/mathewtroy/candle.git` <br>
`cd candle`

2️⃣ **Install dependencies:** <br>
`npm install`

3️⃣ **Create a** `.env` **file and add Firebase + Cloudinary keys:** <br>
```bash
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_CLOUDINARY_CLOUD=your_cloud_name
REACT_APP_CLOUDINARY_PRESET=your_upload_preset
```

4️⃣ **Run the app locally:**
`npm start` <br>
**Visit** http://localhost:3000

## ☁️ Firebase Hosting Deployment
1️⃣  **Install Firebase CLI:** <br>
`npm install -g firebase-tools`

2️⃣  **Log in to Firebase:** <br>
`firebase login`

3️⃣  **Build the project:** <br>
`npm run build`

4️⃣  **Deploy:** <br>
`firebase deploy --only hosting`

**App will be available at** https://candly-krossi.web.app 

## 🔐 Firestore Rules
```bash
rules_version = '2';  <
service cloud.firestore {  
  match /databases/{database}/documents {  
    match /users/{userId} {  
      allow read: if true;  
      allow write: if request.auth != null && request.auth.uid == userId;  
    }  <br>
    match /posts/{postId} {  
      allow read: if true;  
      allow create: if request.auth != null;  
      allow update: if request.auth != null && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes']);  
      allow delete: if request.auth != null && request.auth.uid == resource.data.authorId;  
    } 
  }  
}
```

## 💡 Future Features
- Comment system under posts
- Dark mode theme
- Enhanced search (by posts and tags)
- PWA offline support
- Admin analytics dashboard
- 
## 🧠 Project Purpose
Candly is a social web application built with React and Firebase. 
It showcases modern frontend and backend integration and offers a minimalistic yet meaningful experience - sharing light and kindness through virtual candles.

© 2025 Aleksandr Kross
