import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const style = {
    color: "white",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1000,
    bgcolor: "rgba(47, 113, 100, 0.8)",
    border: "none",
    boxShadow: 24,
    p: 4,
    outline: 'none' //no border for modal
};
const IRAModal = ({ open, handleClose }) => {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h4" component="h1" sx={{textAlign: "center", mb: 3}}>
                    Inflation Reduction Act
                </Typography>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{textAlign: "center"}}>
                    Part 1
                </Typography>
                <Typography id="modal-modal-description" sx={{ my: 2 }}>
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                    industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type
                    and scrambled it to make a type specimen book. It has survived not only five centuries, but also the
                    leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s
                    with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
                    publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                </Typography>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{textAlign: "center"}}>
                    Part 2
                </Typography>
                <Typography id="modal-modal-description" sx={{ my: 2 }}>
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                    industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type
                    and scrambled it to make a type specimen book. It has survived not only five centuries, but also the
                    leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s
                    with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
                    publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                </Typography>
                <Typography id="modal-modal-description" sx={{ my: 2 }}>
                   <i>The IRA data for <b>CSP, RCPP and ACEP</b> will come soon...</i>
                </Typography>
                <Button
                    onClick={handleClose}
                    sx={{
                        "mt": 2,
                        "color": "rgba(47, 113, 100, 0.9)",
                        "backgroundColor": "white ",
                        "&:hover": {
                            backgroundColor: "lightgray"
                        }
                    }}
                >
                    Close
                </Button>
            </Box>
        </Modal>
    );
};

export default IRAModal;
