import React from 'react'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import ReactDom from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PersistGate } from 'redux-persist/integration/react';
import { store,persistor } from './redux/store.ts';



const root = ReactDom.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  // <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <PersistGate loading={null} persistor={persistor}>
            <App />
        </PersistGate>
      </GoogleOAuthProvider>
    </Provider>
  // </React.StrictMode>
)
