import Box from "@mui/material/Box";
import * as React from "react";
import { createTheme, ThemeProvider, Typography } from "@mui/material";
import NavBar from "../components/NavBar";
import Drawer from "../components/title1/ProgramDrawer";
import chartData from "../data/title1/commodities_subprograms_data.json";
import Title1Map from "../components/title1/Title1Map";
import NavSearchBar from "../components/shared/NavSearchBar";
import "../styles/subpage.css";
import Title1TotalMap from "../components/title1/Title1TotalMap";

export default function TitleIPage(): JSX.Element {
  const [checked, setChecked] = React.useState(0);
  const mapColor = ["#F9F9D3", "#F9D48B", "#F59020", "#D95F0E", "#993404"];

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
        <Drawer setTitle1Checked={setChecked} />
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

          {/* <Box
						component="div"
						sx={{
							width: "85%",
							m: "auto",
							display: checked !== 2 ? "none" : "block",
						}}
					>
						<CategoryMap category="Forest management" />
					</Box>
					<Box
						component="div"
						sx={{
							width: "85%",
							m: "auto",
							display: checked !== 3 ? "none" : "block",
						}}
					>
						<CategoryMap category="ARC_CO" />
					</Box>
					<Box
						component="div"
						sx={{
							width: "85%",
							m: "auto",
							display: checked !== 4 ? "none" : "block",
						}}
					>
						<CategoryMap category="Soil remediation" />
					</Box>
					<Box
						component="div"
						sx={{
							width: "85%",
							m: "auto",
							display: checked !== 5 ? "none" : "block",
						}}
					>
						<CategoryMap category="LFP" />
					</Box>
					<Box
						component="div"
						sx={{
							width: "85%",
							m: "auto",
							display: checked !== 6 ? "none" : "block",
						}}
					>
						<CategoryMap category="Other improvement" />
					</Box>
					<Box
						component="div"
						sx={{
							width: "85%",
							m: "auto",
							display: checked !== 7 ? "none" : "block",
						}}
					>
						<CategoryMap category="Soil testing" />
					</Box>
					<Box
						component="div"
						sx={{
							width: "85%",
							m: "auto",
							display: checked !== 8 ? "none" : "block",
						}}
					>
						<CategoryMap category="Other planning" />
					</Box>
					<Box
						component="div"
						sx={{
							width: "85%",
							m: "auto",
							display: checked !== 9 ? "none" : "block",
						}}
					>
						<CategoryMap category="Conservation planning assessment" />
					</Box>
					<Box
						component="div"
						sx={{
							width: "85%",
							m: "auto",
							display: checked !== 10 ? "none" : "block",
						}}
					>
						<CategoryMap category="Resource-conserving crop rotation" />
					</Box>
					<Box
						component="div"
						sx={{
							width: "85%",
							m: "auto",
							display: checked !== 11 ? "none" : "block",
						}}
					>
						<CategoryMap category="Soil health" />
					</Box>
					<Box
						component="div"
						sx={{
							width: "85%",
							m: "auto",
							display: checked !== 12 ? "none" : "block",
						}}
					>
						<CategoryMap category="Comprehensive Nutrient Mgt." />
					</Box>
					<Box
						display="flex"
						justifyContent="center"
						flexDirection="column"
						sx={{ mt: 10, mb: 2 }}
					>
						<Box display="flex" justifyContent="center">
							<Typography variant="h5">
								<strong>Title I: Top Commodities Programs</strong>
							</Typography>
						</Box>
						<Typography sx={{ mt: 2 }}>Title I </Typography>
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 0 ? "none" : "block" }}
					>
						<SemiDonutChart
							data={totalChartData}
							label1={(sixATotal + sixBTotal).toString()}
							label2="EQIP TOTAL BENEFITS"
						/>
					</Box>
					<Box
						component="div"
						sx={{ display: checked >= 1 && checked <= 7 ? "block" : "none" }}
					>
						<SemiDonutChart
							data={sixAChartData}
							label1={sixATotal.toString()}
							label2="6(A) TOTAL BENEFITS"
						/>
					</Box>
					<Box
						component="div"
						sx={{ display: checked >= 8 ? "block" : "none" }}
					>
						<SemiDonutChart
							data={sixBChartData}
							label1={sixBTotal.toString()}
							label2="6(B) TOTAL BENEFITS"
						/>
					</Box>
					<Box display="flex" justifyContent="center" sx={{ mt: 10, mb: 2 }}>
						<Typography variant="h5">
							<strong>Performance by State</strong>
						</Typography>
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 0 ? "none" : "block" }}
					>
						<DataTable />
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 1 ? "none" : "block" }}
					>
						<CategoryTable category="Land management" />
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 2 ? "none" : "block" }}
					>
						<CategoryTable category="Forest management" />
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 3 ? "none" : "block" }}
					>
						<CategoryTable category="ARC_CO" />
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 4 ? "none" : "block" }}
					>
						<CategoryTable category="Soil remediation" />
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 5 ? "none" : "block" }}
					>
						<CategoryTable category="LFP" />
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 6 ? "none" : "block" }}
					>
						<CategoryTable category="Other improvement" />
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 7 ? "none" : "block" }}
					>
						<CategoryTable category="Soil testing" />
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 8 ? "none" : "block" }}
					>
						<CategoryTable category="Other planning" />
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 9 ? "none" : "block" }}
					>
						<CategoryTable category="Conservation planning assessment" />
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 10 ? "none" : "block" }}
					>
						<CategoryTable category="Resource-conserving crop rotation" />
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 11 ? "none" : "block" }}
					>
						<CategoryTable category="Soil health" />
					</Box>
					<Box
						component="div"
						sx={{ display: checked !== 12 ? "none" : "block" }}
					>
						<CategoryTable category="Comprehensive Nutrient Mgt." />
					</Box> */}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
