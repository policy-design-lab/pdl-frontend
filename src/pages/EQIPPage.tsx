import Box from '@mui/material/Box';
import * as React from 'react';
import { createTheme, ThemeProvider, Typography } from '@mui/material';
import NavBar from '../components/NavBar';
import Drawer from '../components/ProgramDrawer';
import SemiDonutChart from '../components/SemiDonutChart';
import DataTable from '../components/DataTable';
import EqipMap from '../components/eqip/EqipMap';
import chartData from '../data/eqip/EQIP_STATUTE_PERFORMANCE_DATA.json';
import CategoryTable from '../components/eqip/CategoryTable';
import CategoryMap from '../components/eqip/CategoryMap';

export default function EQIPPage(): JSX.Element {
    const [checked, setChecked] = React.useState(0);

    const defaultTheme = createTheme();
    let structuralTotal = 0;
    let landManagementTotal = 0;
    let vegetativeTotal = 0;
    let forestManagementTotal = 0;
    let soilRemediationTotal = 0;
    let other6ATotal = 0;
    let soilTestingTotal = 0;

    // eslint-disable-next-line
        const cur = chartData.statutes.find((s) => s.statuteName === '(6)(A) Practices');
    const ACur = cur.practiceCategories;

    const structuralCur = ACur.find((s) => s.practiceCategoryName === 'Structural');
    const landManagementCur = ACur.find((s) => s.practiceCategoryName === 'Land management');
    const vegetativeCur = ACur.find((s) => s.practiceCategoryName === 'Vegetative');
    const forestManagementCur = ACur.find((s) => s.practiceCategoryName === 'Forest management');
    const soilRemediationCur = ACur.find((s) => s.practiceCategoryName === 'Soil remediation');
    const other6ACur = ACur.find((s) => s.practiceCategoryName === 'Other improvement');
    const soilTestingCur = ACur.find((s) => s.practiceCategoryName === 'Soil testing');

    structuralTotal += Number(structuralCur.totalPaymentInDollars);
    landManagementTotal += Number(landManagementCur.totalPaymentInDollars);
    vegetativeTotal += Number(vegetativeCur.totalPaymentInDollars);
    forestManagementTotal += Number(forestManagementCur.totalPaymentInDollars);
    soilRemediationTotal += Number(soilRemediationCur.totalPaymentInDollars);
    other6ATotal += Number(other6ACur.totalPaymentInDollars);
    soilTestingTotal += Number(soilTestingCur.totalPaymentInDollars);

    const pieChartData = [
        { name: 'Structural', value: structuralTotal, color: '#2F7164' },
        { name: 'Land management', value: landManagementTotal, color: '#4D847A' },
        { name: 'Vegetative', value: vegetativeTotal, color: '#749F97' },
        { name: 'Forest management', value: forestManagementTotal, color: '#9CBAB4' },
        { name: 'Other improvement', value: other6ATotal, color: '#B9CDC9' },
        { name: 'Soil remediation', value: soilRemediationTotal, color: '#CDDBD8' },
        { name: 'Soil testing', value: soilTestingTotal, color: '#E2E8E7' }
    ];

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ position: 'fixed', zIndex: 1400, width: '100%' }}>
                    <NavBar />
                </Box>
                <Drawer setEQIPChecked={setChecked} />
                <Box sx={{ pl: 50, pr: 20 }}>
                    <Box component="div" sx={{ m: 'auto', pt: 8, display: checked !== 0 ? 'none' : 'block' }}>
                        <EqipMap />
                    </Box>
                    <Box component="div" sx={{ m: 'auto', pt: 8, display: checked !== 1 ? 'none' : 'block' }}>
                        <CategoryMap category="Land management" />
                    </Box>
                    <Box component="div" sx={{ m: 'auto', pt: 8, display: checked !== 2 ? 'none' : 'block' }}>
                        <CategoryMap category="Forest management" />
                    </Box>
                    <Box component="div" sx={{ m: 'auto', pt: 8, display: checked !== 3 ? 'none' : 'block' }}>
                        <CategoryMap category="Structural" />
                    </Box>
                    <Box component="div" sx={{ m: 'auto', pt: 8, display: checked !== 4 ? 'none' : 'block' }}>
                        <CategoryMap category="Soil remediation" />
                    </Box>
                    <Box component="div" sx={{ m: 'auto', pt: 8, display: checked !== 5 ? 'none' : 'block' }}>
                        <CategoryMap category="Vegetative" />
                    </Box>
                    <Box component="div" sx={{ m: 'auto', pt: 8, display: checked !== 6 ? 'none' : 'block' }}>
                        <CategoryMap category="Other improvement" />
                    </Box>
                    <Box component="div" sx={{ m: 'auto', pt: 8, display: checked !== 7 ? 'none' : 'block' }}>
                        <CategoryMap category="Soil testing" />
                    </Box>
                    <Box component="div" sx={{ m: 'auto', pt: 8, display: checked !== 8 ? 'none' : 'block' }}>
                        <CategoryMap category="Other planning" />
                    </Box>
                    <Box component="div" sx={{ m: 'auto', pt: 8, display: checked !== 9 ? 'none' : 'block' }}>
                        <CategoryMap category="Conservation planning assessment" />
                    </Box>
                    <Box component="div" sx={{ m: 'auto', pt: 8, display: checked !== 10 ? 'none' : 'block' }}>
                        <CategoryMap category="Resource-conserving crop rotation" />
                    </Box>
                    <Box component="div" sx={{ m: 'auto', pt: 8, display: checked !== 11 ? 'none' : 'block' }}>
                        <CategoryMap category="Soil health" />
                    </Box>
                    <Box component="div" sx={{ m: 'auto', pt: 8, display: checked !== 12 ? 'none' : 'block' }}>
                        <CategoryMap category="Comprehensive Nutrient Mgt." />
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
                    <Box component="div" sx={{ display: checked !== 0 ? 'none' : 'block' }}>
                        <DataTable />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 1 ? 'none' : 'block' }}>
                        <CategoryTable category="Land management" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 2 ? 'none' : 'block' }}>
                        <CategoryTable category="Forest management" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 3 ? 'none' : 'block' }}>
                        <CategoryTable category="Structural" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 4 ? 'none' : 'block' }}>
                        <CategoryTable category="Soil remediation" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 5 ? 'none' : 'block' }}>
                        <CategoryTable category="Vegetative" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 6 ? 'none' : 'block' }}>
                        <CategoryTable category="Other improvement" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 7 ? 'none' : 'block' }}>
                        <CategoryTable category="Soil testing" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 8 ? 'none' : 'block' }}>
                        <CategoryTable category="Other planning" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 9 ? 'none' : 'block' }}>
                        <CategoryTable category="Conservation planning assessment" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 10 ? 'none' : 'block' }}>
                        <CategoryTable category="Resource-conserving crop rotation" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 11 ? 'none' : 'block' }}>
                        <CategoryTable category="Soil health" />
                    </Box>
                    <Box component="div" sx={{ display: checked !== 12 ? 'none' : 'block' }}>
                        <CategoryTable category="Comprehensive Nutrient Mgt." />
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}