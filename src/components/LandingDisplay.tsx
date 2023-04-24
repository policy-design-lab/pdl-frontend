import * as React from "react";
import Box from "@mui/material/Box";
import {
	Button,
	Card,
	CardActions,
	CardContent,
	CardMedia,
	Dialog,
	Grid,
	Typography,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router-dom";
import gov from "../images/gov.png";
import teamButton from "../images/buttons/PDL Team Button.png";
import resourceButton from "../images/buttons/Data Resource Button.png";
import "../styles/fonts.css";
import alert from "../images/alert.png";

export default function LandingDisplay({
	programTitle,
}: {
  programTitle: string;
}): JSX.Element {
	let boldText = "";
	let bodyText = "";
	let route = "";
	let buttonText = "";
	let button = <div />;

	const [alertOpen, setAlertOpen] = React.useState(false);

	const handleAlertOpen = () => {
		setAlertOpen(true);
	};

	const handleAlertClose = () => {
		setAlertOpen(false);
	};

	switch (programTitle) {
	case "Title I: Commodities":
		boldText = "What are commodity programs in the farm bill?";
		bodyText =
        "Title I, Commodities cover price and income support for the farmers who raise widely-produced and traded non-perishable crops, like corn, soybeans, wheat, cotton and rice – as well as dairy and sugar. The title also includes agricultural disaster assistance. The map shows the total benefits paid to farmers from of the commodities programs by state from 2018-2022.";

		route = "/";
		buttonText = "Explore Maps of Commodities Programs";
		button = (
			<Button
				variant="contained"
				sx={{
					bgcolor: "#2F7164",
					minWidth: 400,
					minHeight: 80,
					borderRadius: 0,
				}}
				disableElevation
				onClick={handleAlertOpen}
			>
				<Typography variant="subtitle1">
					<strong>{buttonText}</strong>
				</Typography>{" "}
				<ArrowForwardIcon sx={{ mx: 2 }} />
			</Button>
		);
		break;
	case "Title II: Conservation":
		boldText = "What is Title II, conservation programs?";
		bodyText =
        "Title II of the law authorizes the Farm Bill’s conservation programs. The programs in this title programs help agricultural producers and landowners adopt conservation activities on private farm and forest lands. In general, conservation activities are intended to protect and improve water quality and quantity, soil health, wildlife habitat, and air quality. The map shows the total benefit of the conservation program by state from 2018-2022.";
		route = "/eqip";
		buttonText = "Explore Maps of Conservation Programs";
		button = (
			<Button
				variant="contained"
				sx={{
					bgcolor: "#2F7164",
					minWidth: 400,
					minHeight: 80,
					borderRadius: 0,
				}}
				disableElevation
				component={Link}
				to={route}
			>
				<Typography variant="subtitle1">
					<strong>{buttonText}</strong>
				</Typography>{" "}
				<ArrowForwardIcon sx={{ mx: 2 }} />
			</Button>
		);
		break;
	case "Crop Insurance":
		boldText = "What is CROP INSURANCE?";
		bodyText =
        "Crop Insurance provides farmers with the option to purchase insurance policies on the acres of crops they plant to help manage the risks of farming, including to indemnify against losses in yields, crop or whole farm revenue, crop margins and other risks. The program also offsets the cost of the insurance policies through premium subsidies. In addition, the program provides Administrative and Operating (A&O) subsidies to the private crop insurance companies who provide federal crop insurance to farmers. The map shows the total farmer net benefitbenefit of the crop insurance program by state from 2018-2022.";

		route = "/";
		buttonText = "Explore Maps of Crop Insurance";
		button = (
			<Button
				variant="contained"
				sx={{
					bgcolor: "#2F7164",
					minWidth: 400,
					minHeight: 80,
					borderRadius: 0,
				}}
				disableElevation
				onClick={handleAlertOpen}
			>
				<Typography variant="subtitle1">
					<strong>{buttonText}</strong>
				</Typography>{" "}
				<ArrowForwardIcon sx={{ mx: 2 }} />
			</Button>
		);
		break;
	case "Supplemental Nutrition Assistance Program (SNAP)":
		boldText = "What is Farm Bill?";
		bodyText =
        "The Supplemental Nutrition Assistance Program [SNAP] provides financial assistance to low-income families to help cover the cost of food. Benefits can only be used to purchase food products and are provided in electronic format similar to a credit card and known as the Electronic Benefit Transfer (EBT) card. The map shows the total SNAP benefits of the nutrition title by state from 2018-2022.";
		route = "/snap";
		buttonText = "Explore Maps of SNAP";
		button = (
			<Link to="/snap">
				<Button
					variant="contained"
					sx={{
						bgcolor: "#2F7164",
						minWidth: 400,
						minHeight: 80,
						borderRadius: 0,
					}}
					disableElevation
				>
					<Typography variant="subtitle1">
						<strong>{buttonText}</strong>
					</Typography>{" "}
					<ArrowForwardIcon sx={{ mx: 2 }} />
				</Button>
			</Link>

		);
		break;
	case "All Programs":
		boldText = "What is Farm Bill?";
		bodyText =
        "The map shows the total benefits from the current farm bill by state since its last reauthorization from 2018-2022 for the major mandatory titles and programs.\n" +
        "\n" +
        "Federal agricultural, conservation and food assistance policy is periodically reauthorized in omnibus legislation commonly known as the Farm Bill. The Farm Bill authorizes four major categories of mandatory spending programs, benefits distributed to those entitled to receive them and without appropriations. These four categories align with titles in the Farm Bill: Title I Commodities; Title II Conservation assistance; Title XI Crop Insurance; and the Supplemental Nutrition Assistance Program (SNAP) in Title IV. The benefits provided by the commodities and conservation programs, as well as crop insurance, are provided to farmers. The benefits in SNAP are for food assistance to low income families. The most recent reauthorization was the Agricultural Improvement Act of 2018 (P.L. 115-334) and is scheduled to expire in 2023, requiring a reauthorization debate in Congress.";
		route = "/";
		buttonText = "Explore Maps of Total Farm Bill";
		button = (
			<Button
				variant="contained"
				sx={{
					bgcolor: "#2F7164",
					minWidth: 400,
					minHeight: 80,
					borderRadius: 0,
				}}
				disableElevation
				onClick={handleAlertOpen}
			>
				<Typography variant="subtitle1">
					<strong>{buttonText}</strong>
				</Typography>{" "}
				<ArrowForwardIcon sx={{ mx: 2 }} />
			</Button>
		);
		break;
	}
	return (
		<Box sx={{ mx: "auto", width: "90%", mt: 0 }}>
			<Dialog open={alertOpen} onClose={handleAlertClose}>
				<Card sx={{ minWidth: 300, display: "flex", flexDirection: "column" }}>
					<CardContent>
						<Typography
							align="center"
							gutterBottom
							variant="h5"
							component="div"
							sx={{ color: "#242424" }}
						>
							<strong>The page is under construction</strong>
						</Typography>
						<Typography
							align="center"
							gutterBottom
							variant="subtitle1"
							component="div"
							sx={{ color: "#242424" }}
						>
              It will be available as soon as possible
						</Typography>
					</CardContent>
					<CardActions
						disableSpacing
						sx={{ mt: "auto", justifyContent: "center" }}
					>
						<Button
							component={Link}
							to="/"
							size="small"
							onClick={handleAlertClose}
						>
							<strong>Back to HOME</strong>
						</Button>
					</CardActions>
					<CardMedia component="img" height="320" image={alert} />
				</Card>
			</Dialog>
			<div style={{ position: "relative" }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						p: 2,
						m: 2,
						bgcolor: "#ECF0EE",
						my: 15,
					}}
				>
					<div
						style={{
							position: "absolute",
							top: -40,
							right: 16,
						}}
					>
						{button}
					</div>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							width: "85%",
						}}
					>
						<Box sx={{ mt: 5 }}>
							<Typography>
								<strong>{boldText}</strong>
							</Typography>
						</Box>
						<Box sx={{ width: "100%" }}>
							<Typography sx={{ my: 5 }}>{bodyText}</Typography>
						</Box>
					</Box>
				</Box>
			</div>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-evenly",
					p: 1,
					m: 1,
					bgcolor: "background.paper",
					borderRadius: 1,
				}}
			>
				<Grid
					container
					sx={{
						display: "flex",
						p: 0,
						my: 1,
						borderRadius: 1,
						width: "100%",
					}}
				>
					<Grid item xs={12} md={6} sx={{ mx: "auto" }}>
						<CardMedia component="img" src={gov} />
					</Grid>
					<Grid item xs={12} md={6}>
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								mx: "auto",
								my: "5%",
								width: "80%",
								alignContent: "center",
							}}
						>
							<Typography variant="h6" className="allSmallCaps">
								<strong>Learn more about</strong>
							</Typography>
							<Typography variant="h4" className="smallCaps">
								<strong>Policy Design Lab</strong>
							</Typography>
							<Divider sx={{ my: 2 }} />
							<Typography display="block" sx={{ mt: 1, color: "#242424" }}>
								{/* eslint-disable-next-line max-len */}
                The Policy Design Lab is a collaboration with ACES Office of
                Research, iSEE, and NCSA, that will develop unique capabilities
                to translate, apply and integrate research from multiple
                disciplines to the evaluation of existing federal policy and to
                the development of federal policy concepts or ideas, beginning
                with agricultural conservation, sustainability and climate
                change through the Farm Bill Mapping Initiative.
							</Typography>

							<Box sx={{ display: "flex", flexDirection: "row", mt: 8 }}>
								<CardMedia
									component="img"
									src={resourceButton}
									sx={{ maxWidth: 250, mr: 4 }}
								/>
								<CardMedia
									component="img"
									src={teamButton}
									sx={{ maxWidth: 250 }}
								/>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</Box>
		</Box>
	);
}
