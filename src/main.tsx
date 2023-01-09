import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';

export default function Main(): JSX.Element {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
        </Routes>
    );
}
