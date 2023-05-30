import Box from "@mui/material/Box";
import * as React from "react";
import {
  createTheme,
  FormControlLabel,
  Grid,
  RadioGroup,
  SvgIcon,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import NavBar from "../components/NavBar";
import Drawer from "../components/title1/ProgramDrawer";
import chartData from "../data/title1/commodities_subprograms_data.json";
import Title1Map from "../components/title1/Title1Map";
import NavSearchBar from "../components/shared/NavSearchBar";
import TableChartIcon from "@mui/icons-material/TableChart";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import Title1TotalMap from "../components/title1/Title1TotalMap";
import Title1TreeMap from "../components/title1/Title1TreeMap";
import "../styles/subpage.css";
import state_distribution from "../data/title1/commodities_state_distribution_data.json";
import SideBar from "../components/title1/SideBar";
import stateCodes from "../data/stateCodes.json";
import testMenuData from "../components/title1/testMenuData.json";
import Title1ProgramTable from "../components/title1/Title1ProgramTable";

export default function TitleIPage(): JSX.Element {
  const [barStatus, setBarStatus] = React.useState(0);
  const [tab, setTab] = React.useState(0);
  // const [acresData, setAcresData] = React.useState(acres2021);//Replace this after getting real data
  const [benefitData, setbenefitData] = React.useState(chartData);
  const title1Div = React.useRef(null);
  const [checked, setChecked] = React.useState(0);
  const mapColor = ["#F9F9D3", "#F9D48B", "#F59020", "#D95F0E", "#993404"];

  const switchBarTable = (event, newTab) => {
    if (newTab !== null) {
      setTab(newTab);
    }
  };
  const switchBarStatus = (event, selectItem) => {
    if (selectItem !== null) {
      setBarStatus(selectItem);
    }
  };
  const downloadSVG = (status) => {
    if (title1Div.current !== undefined && status) {
      const svgElement = title1Div.current.querySelector("#SNAPBarChart");
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "snap-bar.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  const DownloadIcon = (props) => {
    return (
      <SvgIcon {...props}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-download"
          viewBox="0 0 16 16"
        >
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
        </svg>
      </SvgIcon>
    );
  };
  React.useEffect(() => {
    // PENDING - fetch data from API
    // fetch(`${config.apiUrl}/programs/snap/state-distribution`)
    //     .then((response) => response.json())
    //     .then((d) => setData(d))
    //     .catch((error) => console.error(error));
  }, []);

  const defaultTheme = createTheme();
  let ARC_COTotal = 0;
  let ARC_ICTotal = 0;
  let LFPTotal = 0;
  let LIPTotal = 0;
  let TAPTotal = 0;

  // eslint-disable-next-line
  const curARC = chartData.programs.find(
    (s) => s.programName === "Agriculture Risk Coverage (ARC)"
  );
  const curPLC = chartData.programs.find(
    (s) => s.programName === "Price Loss Coverage (PLC)"
  );
  const curDMC = chartData.programs.find(
    (s) => s.programName === "Dairy Margin Coverage Program (DMC)"
  );
  const curDA = chartData.programs.find(
    (s) => s.programName === "Disaster Assistance"
  );
  const ARCSubprograms = curARC.subPrograms;
  const DASubprograms = curDA.subPrograms;
  const ARC_CO = ARCSubprograms.find(
    (s) =>
      s.subProgramName === "Agriculture Risk Coverage County Option (ARC-CO)"
  );
  const ARC_IC = ARCSubprograms.find(
    (s) =>
      s.subProgramName ===
      "Agriculture Risk Coverage Individual Coverage (ARC-IC)"
  );
  const LFP = DASubprograms.find(
    (s) => s.subProgramName === "Livestock Forage Disaster Program (LFP)"
  );
  const LIP = DASubprograms.find(
    (s) => s.subProgramName === "Livestock Indemnity Program (LIP)"
  );
  const TAP = DASubprograms.find(
    (s) => s.subProgramName === "Tree Assistance Program (TAP)"
  );

  ARC_COTotal += Number(ARC_CO.totalPaymentInDollars);
  ARC_ICTotal += Number(ARC_IC.totalPaymentInDollars);
  LFPTotal += Number(LFP.totalPaymentInDollars);
  LIPTotal += Number(LIP.totalPaymentInDollars);
  TAPTotal += Number(TAP.totalPaymentInDollars);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ position: "fixed", zIndex: 1400, width: "100%" }}>
          <NavBar
            bkColor="rgba(255, 255, 255, 1)"
            ftColor="rgba(47, 113, 100, 1)"
            logo="light"
          />
          <NavSearchBar text="Conservation Programs (Title I)" />
        </Box>
        {/* <Drawer setTitle1Checked={setChecked} /> */}
        <SideBar drawerWidth={300} defaultItem={["ARC: Agriculture Risk Coverage"]} menuData={testMenuData} mainTitle={"Total Commodities Programs Benefits"}/>
        <Box className="halfWidthMainContent">
          <Box
            className="mapArea"
            component="div"
            sx={{
              width: "85%",
              m: "auto",
              display: checked !== 0 ? "none" : "block",
            }}
          >
            <Title1TotalMap
              programName="Agriculture Risk Coverage (ARC)"
              year="2018-2022"
              mapColor={mapColor}
            />
          </Box>
          <Box
            className="mapArea"
            component="div"
            sx={{
              width: "85%",
              m: "auto",
              display: checked !== 1 ? "none" : "block",
            }}
          >
            <Title1Map
              program="Agriculture Risk Coverage (ARC)"
              subprogram="Agriculture Risk Coverage County Option (ARC-CO)"
              year="2018-2022"
              mapColor={mapColor}
            />
          </Box>
          <Box
            className="mapArea"
            component="div"
            sx={{
              width: "85%",
              m: "auto",
              display: checked !== 2 ? "none" : "block",
            }}
          >
            <Title1Map
              program="Agriculture Risk Coverage (ARC)"
              subprogram="Agriculture Risk Coverage Individual Coverage (ARC-IC)"
              year="2018-2022"
              mapColor={mapColor}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              height: 50,
            }}
          />
          <Box
            className="chartArea"
            component="div"
            ref={title1Div}
            sx={{
              width: "85%",
              m: "auto",
              display: checked !== 0 ? "none" : "block",
            }}
          >
            <Grid
              container
              columns={{ xs: 12 }}
              className="stateTitleContainer"
            >
              <Typography className="stateTitle" variant="h4">
                Performance by States
              </Typography>
              <ToggleButtonGroup
                className="BarTableToggle"
                value={tab}
                exclusive
                onChange={switchBarTable}
                aria-label="SNAP toggle button group"
                sx={{ justifyContent: "flex-end" }}
              >
                <ToggleButton value={0}>
                  <InsertChartIcon />
                </ToggleButton>
                <ToggleButton value={1}>
                  <TableChartIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid
              container
              columns={{ xs: 12 }}
              sx={{
                paddingTop: 6,
                justifyContent: "center",
              }}
            >
              <Box sx={{ display: tab !== 0 ? "none" : "div" }}>
                <Grid
                  container
                  columns={{ xs: 12 }}
                  className="stateChartTableContainer"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Grid
                    item
                    xs={7}
                    justifyContent="flex-start"
                    alignItems="center"
                    sx={{ display: "flex" }}
                  >
                    <Typography
                      id="snapBarHeader"
                      variant="h6"
                      sx={{
                        fontWeight: 400,
                        paddingLeft: 0,
                        fontSize: "1.2em",
                        color: "#212121",
                      }}
                    >
                      Comparing ARC-CO Benefits, Payment Recipients and Base
                      Acres(2018-2022)
                    </Typography>
                    <DownloadIcon
                      sx={{
                        paddingLeft: 1,
                        paddingTop: 1.5,
                        fontSize: "2.5em",
                        color: "#212121",
                        cursor: "pointer",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        downloadSVG(true);
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid
                  container
                  columns={{ xs: 12 }}
                  className="reminderContainer"
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 400,
                      paddingLeft: 0,
                      fontSize: "0.8em",
                      color: "rgb(163, 163, 163)",
                    }}
                  >
                    Hover on the state names to see detailed data
                  </Typography>
                </Grid>
                <Grid container columns={{ xs: 12 }}>
                  <Grid
                    container
                    item
                    xs={12}
                    id="snapBarContainer"
                    sx={{ display: "flex" }}
                    ref={title1Div}
                  >
                    <Title1TreeMap data={state_distribution} year="2018-2022"/>
                  </Grid>
                </Grid>
              </Box>
              <Box
                id="snapTableContainer"
                sx={{ display: tab !== 1 ? "none" : "div" }}
              >
                <Grid
                  container
                  columns={{ xs: 12 }}
                  className="stateChartTableContainer"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Grid
                    item
                    xs={7}
                    justifyContent="flex-start"
                    alignItems="center"
                    sx={{ display: "flex" }}
                  >
                    <Box id="snapTableHeader" sx={{ width: "100%" }}>
                      <Typography
                        variant="h6"
                        sx={{
                          display: "flex-box",
                          fontWeight: 400,
                          paddingLeft: 0,
                          fontSize: "1.2em",
                          color: "#212121",
                          paddingTop: 1.5,
                        }}
                      >
                        Comparing ARC-CO Benefits, Payment Recipients and Base
                        Acres(2018-2022)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ width: "100%" }}>
                  <Title1ProgramTable program="Agriculture Risk Coverage (ARC)" subprogram="Agriculture Risk Coverage County Option (ARC-CO)" stateCodes={stateCodes} Title1Data={state_distribution} yearKey="2018-2022" color1="#66BB6A" color2="#FAB34A"/>
                </Box>
              </Box>
            </Grid>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
