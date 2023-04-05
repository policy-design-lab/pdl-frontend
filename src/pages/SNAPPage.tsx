import * as React from "react";
import {
  Drawer,
  Box,
  MenuItem,
  createTheme,
  ThemeProvider,
  Typography,
  CardMedia
} from "@mui/material";
import NavBar from "../components/NavBar";
//import Drawer from '../components/snap/SNAPDrawer';
import SemiDonutChart from "../components/SemiDonutChart";
import DataTable from "../components/eqip/EQIPTotalTable";
import EqipTotalMap from "../components/eqip/EqipTotalMap";
import chartData from "../data/eqip/EQIP_STATUTE_PERFORMANCE_DATA.json";
import CategoryTable from "../components/eqip/CategoryTable";
import CategoryMap from "../components/eqip/CategoryMap";
import TotalBenefitMap from "../components/snap/SNAPMap";
import SNAPMap from "../components/snap/SNAPMap";
import LandingPageMap from "../components/LandingPageMap";
import snap from "../images/legends/SNAP programs benefits 2018 - 2022.png";
import SnapTable from "../components/snap/SNAPTable";

export default function SNAPPage(): JSX.Element {
  const [checkedIndex, setCheckedIndex] = React.useState(0);
  const defaultTheme = createTheme();

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
          <NavBar />
        </Box>

        {/* 66 .v.s 2128  */}
        <Box sx={{ position: "relative", top: 100, width: "70%", m: "0 auto" }}>

            {/**Legend Session */}
            <Box sx={{ display: "flex", justifyContent: "center"}}>
              <CardMedia
                sx={{ maxWidth: 720, mt: 3 }}
                component="img"
                src={snap}
              />
            </Box>

            {/**Map Session */}
            <LandingPageMap programTitle="Supplemental Nutrition Assistance Program (SNAP)" />


            {/**Title Bar - temp hight 50*/}
            <Box
              sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  height: 50
              }}
          >
            </Box>

            {/**Bar/Table Session */}
            <Box
            sx={{
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <SnapTable />
          </Box>

          
        </Box>
      </Box>
    </ThemeProvider>
  );
}
