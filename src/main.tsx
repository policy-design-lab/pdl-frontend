import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import EQIPPage from "./pages/EQIPPage";
import CSPPage from "./pages/CSPPage";
import CRPPage from "./pages/CRPPage";
import RCPPPage from "./pages/RCPPPage";
import SNAPPage from "./pages/SNAPPage";
import TitleIPage from "./pages/TitleIPage";
import CropInsurancePage from "./pages/CropInsurancePage";
import ACEPPage from "./pages/ACEPPage";

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
                <Route path="/csp" element={<CSPPage />} />
                <Route path="/crp" element={<CRPPage />} />
                <Route path="/rcpp" element={<RCPPPage />} />
                <Route path="/title1" element={<TitleIPage />} />
                <Route path="/cropinsurance" element={<CropInsurancePage />} />
                <Route path="/snap" element={<SNAPPage />} />
            </Routes>
        </ScrollToTop>
    );
}
