import * as React from "react";
import {
  ToggleButton,
  Box,
  ToggleButtonGroup,
  createTheme,
  ThemeProvider,
  Typography,
  CardMedia,
  Icon,
} from "@mui/material";
import NavBar from "../components/NavBar";

import LandingPageMap from "../components/LandingPageMap";
import snap from "../images/legends/SNAP programs benefits 2018 - 2022.png";
import SnapTable from "../components/snap/SNAPTable";
import SNAPBar from "../components/snap/SNAPBar";

import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";

export default function SNAPPage(): JSX.Element {
  const [tab, setTab] = React.useState(0);
  const defaultTheme = createTheme({
    spacing: 8,
  });

  const handleChange = (event, newTab) => {
    window.alert(newTab);
    setTab(newTab);
  };

  function HomeIcon(props) {
    return (
      <SvgIcon {...props}>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </SvgIcon>
    );
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
          <NavBar />
        </Box>

        {/* 66 .v.s 2128  */}
        <Box sx={{ position: "relative", top: 100, width: "70%", m: "0 auto" }}>
          {/**Legend Session */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
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
              display: "flex",
              justifyContent: "center",
              height: 50,
            }}
          ></Box>

          {/**Bar/Table Session */}
          <Box component="div">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                borderBottom: "1px solid #e4ebe7",
                padding: 2,
              }}
            >
              <Typography variant="h4" sx={{ mt: 5 }}>
                Performance by States
              </Typography>

              <ToggleButtonGroup
                value={tab}
                exclusive
                onChange={handleChange}
                aria-label="SNAP toggle button group"
              >
                <ToggleButton value={0}>
                  <BarChartIcon />
                </ToggleButton>
                <ToggleButton value={1}>
                  <TableChartIcon />
                  {/* Change this later to font awesome or svg image */}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                paddingTop: 8,
              }}
            >
              <Box sx={{ display: tab !== 0 ? "none" : "div" }}>
                <SNAPBar
                  margin={{ top: 20, right: 80, bottom: 30, left: 80 }}
                  w={1500}
                  h={800}
                />
              </Box>
              <Box sx={{ display: tab !== 1 ? "none" : "div" }}>
                <SnapTable />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/**Filler - temp hight 50*/}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          height: 50,
        }}
      ></Box>
    </ThemeProvider>
  );
}
