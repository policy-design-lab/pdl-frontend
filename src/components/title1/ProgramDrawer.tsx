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
// import "../styles/ProgramDrawer.css";

const drawerWidth = 240;

Title1CheckboxList.propTypes = {
  setTitle1Checked: PropTypes.func,
  setShowPopUp: PropTypes.func,
};

ProgramDrawer.propTypes = {
  setTitle1Checked: PropTypes.func,
};

let currentChecked = 0;
function Title1CheckboxList({ setTitle1Checked, setShowPopUp }) {
  const [checked, setChecked] = React.useState(currentChecked);

  const handleToggle = (value: number) => () => {
    setChecked(value);
    setTitle1Checked(value);
    currentChecked = value;
    setShowPopUp(false);
  };

  const Title1List = [
    "Agriculture Risk Coverage (ARC)",
    "Agriculture Risk Coverage County Option (ARC-CO)",
    "Agriculture Risk Coverage Individual Coverage (ARC-IC)",
  ];
  
  return (
    <List sx={{ width: "100%", maxWidth: 360, bgcolor: "#ecf0ee" }}>
      {Title1List.map((category, value) => {
        const labelId = `checkbox-list-label-${value}`;
        if (category === "Agriculture Risk Coverage (ARC)") {
          return (
            <ListItem key={category} disablePadding>
              <ListItemButton
                role={undefined}
                onClick={handleToggle(value)}
                dense
              >
                <Radio
                  edge="start"
                  checked={checked === value}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                  sx={{
                    "&.Mui-checked": {
                      color: "#2f7164",
                    },
                  }}
                />
                <ListItemText id={labelId} primary={category} />
              </ListItemButton>
            </ListItem>
          );
        }
        return (
          <Box key={category}>
            <ListItem key={category} disablePadding>
              <ListItemButton
                role={undefined}
                onClick={handleToggle(value)}
                dense
                sx={{ pl: 8 }}
              >
                <Radio
                  edge="start"
                  checked={checked === value}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                  sx={{
                    "&.Mui-checked": {
                      color: "#2f7164",
                    },
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

export default function ProgramDrawer({ setTitle1Checked }): JSX.Element {
  const location = useLocation();
  const [Title1Open, setTitle1Open] = React.useState(false);
  const Title1Ref = React.useRef<HTMLLIElement>(null);
  const handleTitle1Click = () => {
    setTitle1Open((prevTitle1Open) => !prevTitle1Open);
  };
  const prevTitle1Open = React.useRef(Title1Open);
  React.useEffect(() => {
    if (prevTitle1Open.current === true && Title1Open === false) {
      Title1Ref.current.focus();
    }

    prevTitle1Open.current = Title1Open;
  }, [Title1Open]);

  return (
    <Drawer
      className="sideBar"
      variant="permanent"
      sx={{
        display: { xs: "none", sm: "block" },
        "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
      }}
      PaperProps={{
        sx: {
          backgroundColor: "#ffffff",
          color: "gray",
        },
      }}
      open
    >
      <Box id="filler" />
      <MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
        <Typography>Total Conservation Programs Benefits</Typography>
      </MenuItem>
      <Box>
        <MenuItem
          ref={Title1Ref}
          style={{ whiteSpace: "normal" }}
          sx={{
            my: 1,
            pl: 3,
            pr: 0,
            py: 0,
            backgroundColor: Title1Open ? "#ecf0ee" : "grey",
          }}
          onClick={handleTitle1Click}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "horizontal",
              alignItems: "center",
            }}
          >
            {Title1Open ? (
              <Typography sx={{ color: "#2f7164" }}>
                <strong>Agriculture Risk Coverage (ARC)</strong>
              </Typography>
            ) : (
              <Typography>
                Agriculture Risk Coverage (ARC)
              </Typography>
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
                maxHeight: 48,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ rotate: "270deg", pt: 6, pb: 0 }}
              >
                <Box sx={{ display: "flex", flexDirection: "horizontal" }}>
                  <strong>PROGRAM</strong>
                  <KeyboardArrowDownIcon />
                </Box>
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        <Popper
          open={Title1Open}
          anchorEl={Title1Ref.current}
          role={undefined}
          placement="right-start"
        >
          <Box>
            <Title1CheckboxList
              setTitle1Checked={setTitle1Checked}
              setShowPopUp={setTitle1Open}
            />
          </Box>
        </Popper>
      </Box>
      <MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
        <Typography>Price Loss Coverage (PLC)</Typography>
      </MenuItem>
      <MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
        <Typography>Dairy Margin Coverage Program (DMC)</Typography>
      </MenuItem>
      <MenuItem style={{ whiteSpace: "normal" }} sx={{ my: 1, pl: 3 }}>
        <Typography>Disaster Assistance</Typography>
      </MenuItem>
    </Drawer>
  );
}
