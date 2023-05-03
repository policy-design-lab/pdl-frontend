import * as React from "react";
import { CardMedia, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import NavBar from "../components/NavBar";
import forest from "../images/forest.png";
import News from "../components/News";
import Footer from "../components/Footer";
import LandingPageMapTab from "../components/LandingPageMapTab";

export default function LandingPage(): JSX.Element {
	return (
		<Box sx={{ width: "100%" }}>
			<NavBar />
			<div style={{ position: "relative" }}>
				<CardMedia component="img" src={forest} sx={{ maxHeight: "650px" }} />
				<Typography
					variant="h3"
					sx={{
						position: "absolute",
						color: "white",
						top: "30%",
						left: "10%"
					}}
				>
					<strong>Understanding</strong>
				</Typography>
				<Typography
					variant="h3"
					sx={{
						position: "absolute",
						top: "40%",
						left: "10%",
						color: "white"
					}}
				>
					<Box sx={{ color: "#FF8C22" }}>
						<strong>Policy Design:</strong>
					</Box>
				</Typography>
				<Typography
					variant="h6"
					sx={{
						position: "absolute",
						color: "white",
						top: "50%",
						left: "10%"
					}}
				>
                    Applying Public Data and Computational Resources to
				</Typography>
				<Typography
					variant="h6"
					sx={{
						position: "absolute",
						color: "white",
						top: "55%",
						left: "10%"
					}}
				>
                    Visualize Federal Agricultural, Conservation and Food Policies
				</Typography>
			</div>
			<LandingPageMapTab />
			<News />
			<Footer />
		</Box>
	);
}
