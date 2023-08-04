import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import EQIPPage from "./pages/EQIPPage";
import CSPPage from "./pages/CSPPage";
import SNAPPage from "./pages/SNAPPage";
import TitleIPage from "./pages/TitleIPage";
import CropInsurancePage from "./pages/CropInsurancePage";

const ScrollToTop = (props: any) => {
    const location = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return <>{props.children}</>;
};

/**
 * TODO
 * in the future, we can add the common datasets such as summary, statecodes here in stead of re-loading them in each page to reduce redundant API calls
 */
export default function Main(): JSX.Element {
    return (
        <ScrollToTop>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/eqip" element={<EQIPPage />} />
                <Route path="/csp" element={<CSPPage />} />
                <Route path="/title1" element={<TitleIPage />} />
                <Route path="/cropinsurance" element={<CropInsurancePage />} />
                <Route path="/snap" element={<SNAPPage />} />
            </Routes>
        </ScrollToTop>
    );
}
