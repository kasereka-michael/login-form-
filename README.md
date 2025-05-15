# React Native Expo Login and Registration App

A professional login and registration application built with React Native and Expo. This project demonstrates how to implement authentication flows in a React Native application with a clean and modern UI.

## Features

- User authentication (Login/Register/Logout)
- Form validation using Formik and Yup
- Professional UI with React Native Paper
- Navigation between screens
- Mock API service for authentication
- Responsive design that works on various screen sizes

## Screenshots

(Screenshots will be added after running the app)

## Prerequisites

- Node.js (>= 12.x)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd loginForm
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Running the App

1. Start the development server:
```bash
npm start
# or
yarn start
```

2. Open the app:
   - Use the Expo Go app on your phone to scan the QR code
   - Press 'a' to open on an Android emulator
   - Press 'i' to open on an iOS simulator

## Project Structure

```
loginForm/
├── App.js                # Main application component
├── index.js              # Entry point
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── package.json          # Dependencies and scripts
├── src/                  # Source code
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.js    # Login screen
│   │   ├── RegisterScreen.js # Registration screen
│   │   └── HomeScreen.js     # Home screen after login
│   ├── services/         # API services
│   │   └── authService.js    # Authentication service
```

## Testing the App

### Login
You can log in with the following test credentials:
- Email: test@example.com
- Password: password123

### Register
You can register a new account with:
- Name: Any name
- Email: Any valid email format
- Password: At least 6 characters
- Confirm Password: Must match the password

## Technologies Used

- React Native
- Expo
- React Navigation
- React Native Paper (UI components)
- Formik (Form handling)
- Yup (Form validation)
- Axios (API requests)

## Future Improvements

- Add persistent authentication using AsyncStorage or SecureStore
- Implement password reset functionality
- Add social login options (Google, Facebook, etc.)
- Enhance UI with animations
- Add unit and integration tests
- Connect to a real backend API

## License

MIT# login-form-
