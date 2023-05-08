import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import EQIPPage from "./pages/EQIPPage";
import SNAPPage from "./pages/SNAPPage";
import CRPPage from "./pages/CRPPage";

const ScrollToTop = (props: any) => {
    const location = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return <>{props.children}</>;
};
export default function Main(): JSX.Element {
    return (
        <ScrollToTop>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/eqip" element={<EQIPPage />} />
                <Route path="/snap" element={<SNAPPage />} />
                <Route path="/crp" element={<CRPPage />} />
            </Routes>
        </ScrollToTop>
    );
}
