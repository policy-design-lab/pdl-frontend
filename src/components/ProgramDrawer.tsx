import React from "react";
import Drawer from "@mui/material/Drawer";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import { Popper, Radio, Typography } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const drawerWidth = 240;

EQIPCheckboxList.propTypes = {
	setEQIPChecked: PropTypes.func,
	setShowPopUp: PropTypes.func
};

ProgramDrawer.propTypes = {
	setEQIPChecked: PropTypes.func
};

let currentChecked = 0;
function EQIPCheckboxList({ setEQIPChecked, setShowPopUp }) {
	const [checked, setChecked] = React.useState(currentChecked);

	const handleToggle = (value: number) => () => {
		setChecked(value);
		setEQIPChecked(value);
		currentChecked = value;
		setShowPopUp(false);
	};

	const EQIPList = [
		"Total EQIP Benefits",
		"Land management",
		"Forest management",
		"Structural",
		"Soil remediation",
		"Vegetative",
		"Other improvement",
		"Soil testing",
		"Other planning",
		"Conservation planning assessment",
		"Resource-conserving crop rotation",
		"Soil health",
		"Comprehensive Nutrient Mgt."
	];

	return (
		<List sx={{ width: "100%", maxWidth: 360, bgcolor: "#ecf0ee" }}>
			{EQIPList.map((category, value) => {
				const labelId = `checkbox-list-label-${value}`;
				if (
					category !== "Land management" &&
                    category !== "Other planning" &&
                    category !== "Total EQIP Benefits"
				) {
					return (
						<ListItem key={category} disablePadding>
							<ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 8 }}>
								<Radio
									edge="start"
									checked={checked === value}
									tabIndex={-1}
									disableRipple
									inputProps={{ "aria-labelledby": labelId }}
									sx={{
										"&.Mui-checked": {
											color: "#2f7164"
										}
									}}
								/>
								<ListItemText id={labelId} primary={category} />
							</ListItemButton>
						</ListItem>
					);
				}
				if (category === "Total EQIP Benefits") {
					return (
						<ListItem key={category} disablePadding>
							<ListItemButton role={undefined} onClick={handleToggle(value)} dense>
								<Radio
									edge="start"
									checked={checked === value}
									tabIndex={-1}
									disableRipple
									inputProps={{ "aria-labelledby": labelId }}
									sx={{
										"&.Mui-checked": {
											color: "#2f7164"
										}
									}}
								/>
								<ListItemText id={labelId} primary={category} />
							</ListItemButton>
						</ListItem>
					);
				}
				if (category === "Land management") {
					return (
						<Box>
							<Typography sx={{ pl: 8 }}>
								<strong>(6)(A) Practices</strong>
							</Typography>
							<ListItem key={category} disablePadding>
								<ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 8 }}>
									<Radio
										edge="start"
										checked={checked === value}
										tabIndex={-1}
										disableRipple
										inputProps={{ "aria-labelledby": labelId }}
										sx={{
											"&.Mui-checked": {
												color: "#2f7164"
											}
										}}
									/>
									<ListItemText id={labelId} primary={category} />
								</ListItemButton>
							</ListItem>
						</Box>
					);
				}
				return (
					<Box key={category}>
						<Typography sx={{ pl: 8 }}>
							<strong>(6)(B) Practices</strong>
						</Typography>
						<ListItem key={category} disablePadding>
							<ListItemButton role={undefined} onClick={handleToggle(value)} dense sx={{ pl: 8 }}>
								<Radio
									edge="start"
									checked={checked === value}
									tabIndex={-1}
									disableRipple
									inputProps={{ "aria-labelledby": labelId }}
									sx={{
										"&.Mui-checked": {
											color: "#2f7164"
										}
									}}
								/>
								<ListItemText id={labelId} primary={category} />
							</ListItemButton>
						</ListItem>
					</Box>
				);
			})}
		</List>
	);
}

export default function ProgramDrawer({ setEQIPChecked }): JSX.Element {
	const location = useLocation();
	const [eqipOpen, setEqipOpen] = React.useState(false);
	const eqipRef = React.useRef<HTMLLIElement>(null);
	const handleEqipClick = () => {
		setEqipOpen((prevEqipOpen) => !prevEqipOpen);
	};
	const prevEqipOpen = React.useRef(eqipOpen);
	React.useEffect(() => {
		if (prevEqipOpen.current === true && eqipOpen === false) {
			eqipRef.current.focus();
		}

		prevEqipOpen.current = eqipOpen;
	}, [eqipOpen]);

	return (
		<Drawer
			variant="permanent"
			sx={{
				"display": { xs: "none", sm: "block" },
				"& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth }
			}}
			PaperProps={{
				sx: {
					backgroundColor: "#ffffff",
					color: "gray"
				}
			}}
			open
		>
			<Box sx={{ height: 100 }} />
			<MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
				<Typography>Total Conservation Programs Benefits</Typography>
			</MenuItem>
			<Box>
				<MenuItem
					ref={eqipRef}
					style={{ whiteSpace: "normal" }}
					sx={{ my: 1, pl: 3, pr: 0, py: 0, backgroundColor: eqipOpen ? "#ecf0ee" : "grey" }}
					onClick={handleEqipClick}
				>
					<Box sx={{ display: "flex", flexDirection: "horizontal", alignItems: "center" }}>
						{eqipOpen ? (
							<Typography sx={{ color: "#2f7164" }}>
								<strong>EQIP: Environmental Quality Incentives Program</strong>
							</Typography>
						) : (
							<Typography>EQIP: Environmental Quality Incentives Program</Typography>
						)}
						<Box
							sx={{
								maxWidth: 40,
								py: 3,
								color: "#ffffff",
								backgroundColor: "#2f7164",
								display: "flex",
								alignItems: "center",
								justifyContent: "flex-end",
								maxHeight: 48
							}}
						>
							<Typography variant="subtitle2" sx={{ rotate: "270deg", pt: 6, pb: 0 }}>
								<Box sx={{ display: "flex", flexDirection: "horizontal" }}>
									<strong>STATUTE</strong>
									<KeyboardArrowDownIcon />
								</Box>
							</Typography>
						</Box>
					</Box>
				</MenuItem>
				<Popper open={eqipOpen} anchorEl={eqipRef.current} role={undefined} placement="right-start">
					<Box>
						<EQIPCheckboxList setEQIPChecked={setEQIPChecked} setShowPopUp={setEqipOpen} />
					</Box>
				</Popper>
			</Box>
			<MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
				<Typography>CSP: Conservation Stewardship Program</Typography>
			</MenuItem>
			<MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
				<Typography>CRP: Conservation Reserve Program</Typography>
			</MenuItem>
			<MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
				<Typography>ACEP: Agriculture Conservation Easement Program</Typography>
			</MenuItem>
			<MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
				<Typography>RCPP: Regional Conservation Partnership Program</Typography>
			</MenuItem>
			<MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
				<Typography>Other Conservation</Typography>
			</MenuItem>
		</Drawer>
	);
}
