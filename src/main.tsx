import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import EQIPPage from './pages/EQIPPage';

export default function Main(): JSX.Element {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/eqip" element={<EQIPPage />} />
        </Routes>
    );
}
