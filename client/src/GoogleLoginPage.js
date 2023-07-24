// GoogleLoginPage.js
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';
import { useHistory } from 'react-router-dom';
import './App.css';

const GoogleLoginPage = () => {
  const history = useHistory();
  const handleSuccess = (credentialResponse) => {
    const details = jwt_decode(credentialResponse.credential);
    console.log(details);
    console.log(credentialResponse);
    history.push({
      pathname: '/app',
      state: { profileImageUrl: details.picture , profileName : details.name},
    });
  };

  const handleFailure = () => {
    console.log('Login Failed');
  };

  return (
    <div className='main-container'>
      <div className="center-container">
        <h1>Welcome to ChatGPT</h1>
        <h2>Sign in using Google</h2>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID} redirectUri="/">
          <div className="google-signin-button">
            <GoogleLogin onSuccess={handleSuccess} onError={handleFailure} />
          </div>
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default GoogleLoginPage;
