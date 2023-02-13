import Box from '@mui/material/Box';
import * as React from 'react';
import { createTheme, ThemeProvider, Typography } from '@mui/material';
import NavBar from '../components/NavBar';
import Drawer from '../components/ProgramDrawer';
import SemiDonutChart from '../components/SemiDonutChart';
import eqipSummary from '../data/eqipSummary.json';
import DataTable from '../components/DataTable';
import EqipMap from '../components/eqip/EqipMap';

export default function EQIPPage(): JSX.Element {
    const defaultTheme = createTheme();
    let structuralTotal = 0;
    let landManagementTotal = 0;
    let vegetativeTotal = 0;
    let forestManagementTotal = 0;
    let soilRemediationTotal = 0;
    let other6ATotal = 0;

    Object.entries(eqipSummary).forEach((entry) => {
        // eslint-disable-next-line
        const [key, value] = entry;
        const totalYearsCur = eqipSummary[key].find((s) => s.years === '2018-2022');
        const ACur = totalYearsCur.statutes.find((s) => s.statuteName === '(6)(A) Practices');

        const structuralCur = ACur.statueCategories.find((s) => s.statueCategoryName === 'Structural');
        const landManagementCur = ACur.statueCategories.find((s) => s.statueCategoryName === 'Land management');
        const vegetativeCur = ACur.statueCategories.find((s) => s.statueCategoryName === 'Vegetative');
        const forestManagementCur = ACur.statueCategories.find((s) => s.statueCategoryName === 'Forest management');
        const soilRemediationCur = ACur.statueCategories.find((s) => s.statueCategoryName === 'Soil remediation');
        const other6ACur = ACur.statueCategories.find((s) => s.statueCategoryName === 'Other improvement');

        structuralTotal += Number(structuralCur.paymentInDollars);
        landManagementTotal += Number(landManagementCur.paymentInDollars);
        vegetativeTotal += Number(vegetativeCur.paymentInDollars);
        forestManagementTotal += Number(forestManagementCur.paymentInDollars);
        soilRemediationTotal += Number(soilRemediationCur.paymentInDollars);
        other6ATotal += Number(other6ACur.paymentInDollars);
    });

    const pieChartData = [
        { name: 'Structural', value: structuralTotal, color: '#2F7164' },
        { name: 'Land management', value: landManagementTotal, color: '#4D847A' },
        { name: 'Vegetative', value: vegetativeTotal, color: '#749F97' },
        { name: 'Forest management', value: forestManagementTotal, color: '#9CBAB4' },
        { name: 'Soil remediation', value: soilRemediationTotal, color: '#B9CDC9' },
        { name: 'Other improvement', value: other6ATotal, color: '#CDDBD8' }
    ];

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ position: 'fixed', zIndex: 1400, width: '100%' }}>
                    <NavBar />
                </Box>
                <Drawer />
                <Box sx={{ pl: 50, pr: 20 }}>
                    <Box sx={{ m: 'auto', pt: 8 }}>
                        <EqipMap />
                    </Box>
                    <Box display="flex" justifyContent="center" flexDirection="column" sx={{ mt: 10, mb: 2 }}>
                        <Box display="flex" justifyContent="center">
                            <Typography variant="h5">
                                <strong>Performance of Each Statute’s in EQIP</strong>
                            </Typography>
                        </Box>
                        <Typography sx={{ mt: 2 }}>
                            There are 7 categories of EQIP. There are 7 categories of EQIP. There are 7 categories of
                            EQIP. There are 7 categories of EQIP. There are 7 categories of EQIP. There are 7 categories
                            of EQIP. There are 7 categories of EQIP. There are 7 categories of EQIP. There are 7
                            categories of EQIP. There are 7 categories of EQIP. There are 7 categories of EQIP. There
                            are 7 categories of EQIP. There are 7 categories of EQIP. There are 7 categories of EQIP.
                        </Typography>
                    </Box>
                    <SemiDonutChart data={pieChartData} />
                    <Box display="flex" justifyContent="center" sx={{ mt: 10, mb: 2 }}>
                        <Typography variant="h5">
                            <strong>States Performance</strong>
                        </Typography>
                    </Box>
                    <DataTable />
                </Box>
            </Box>
        </ThemeProvider>
    );
}
