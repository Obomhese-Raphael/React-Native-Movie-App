# **Movie Flex 🎬**

**Movie Flex** is a modern and intuitive mobile application for discovering and exploring movies. Built with **React Native** and **Expo**, the app provides a seamless and responsive user experience on both iOS and Android devices. It leverages the extensive data from the **TMDB API** to offer a rich, detailed, and up-to-date movie database.

![WhatsApp Image 2025-08-11 at 13 37 55_bf4d3d38](https://github.com/user-attachments/assets/cf3263f4-ed38-41a8-a54e-bc83a9eb9f7a)


## **Features ✨**

  * **Discover Movies:** Browse trending, popular, and upcoming movies with stunning visuals.
  * **Detailed Movie Information:** Get in-depth details about any movie, including ratings, cast, crew, trailers, and synopses.
  * **Search Functionality:** Quickly find movies by title.
  * **User Authentication:** Securely sign in and manage your account using **Clerk**.
  * **Responsive UI:** A beautiful and consistent user interface built with **Tailwind CSS**.

## **Technologies Used 🚀**

  * **React Native:** The core framework for building the cross-platform mobile application.
  * **Expo:** A powerful toolchain for building universal native apps with React Native.
  * **Tailwind CSS:** A utility-first CSS framework for styling components.
  * **Clerk:** A complete user authentication and management platform.
  * **TMDB API:** The primary data source for all movie-related information.

## **Prerequisites ⚙️**

Before you begin, ensure you have the following installed on your machine:

  * Node.js (LTS version)
  * npm or yarn
  * Expo CLI

## **Getting Started 🛠️**

Follow these steps to set up and run the project locally.

### **1. Clone the Repository**

```bash
git clone https://github.com/Obomhese-Raphael/React-Native-Movie-App.git
cd mobile_movie_app (check ls in the terminal for file configuration)
```

### **2. Install Dependencies**

```bash
npm install
# or
yarn install
```

### **3. Environment Variables**

You will need to set up your environment variables for the TMDB API and Clerk.

Create a `.env` file in the root directory and add the following keys:

```
EXPO_PUBLIC_TMDB_API_KEY=YOUR_TMDB_API_KEY
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
EXPO_PUBLIC_APPWRITE_COLLECTION_ID=YOUR_EXPO_PUBLIC_APPWRITE_COLLECTION_ID
EXPO_PUBLIC_APPWRITE_DATABASE_ID=YOUR_EXPO_PUBLIC_APPWRITE_DATABASE_ID
EXPO_PUBLIC_APPWRITE_ENDPOINT=YOUR_EXPO_PUBLIC_APPWRITE_ENDPOINT
EXPO_PUBLIC_APPWRITE_PROJECT_ID=YOUR_EXPO_PUBLIC_APPWRITE_PROJECT_ID
EXPO_PUBLIC_MOVIE_API_KEY=YOUR_EXPO_PUBLIC_MOVIE_API_KEY
```

> **Note:** You can get your **TMDB API key** by signing up on the [TMDB website](https://www.themoviedb.org/documentation/api). For the **Clerk keys**, sign up on the [Clerk dashboard](https://dashboard.clerk.com).

### **4. Run the Application**

Start the Expo development server:

```bash
npm start
# or
yarn start
```

This will launch the Expo Metro bundler. You can then use the Expo Go app on your mobile device to scan the QR code and view the app.

## **Contributing**

We welcome contributions\! Feel free to open an issue or submit a pull request.

## **License**

This project is licensed under the MIT License.
