import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const style = {
    "color": "white",
    "position": "absolute",
    "top": "50%",
    "left": "50%",
    "transform": "translate(-50%, -50%)",
    "width": "60vw",
    "overflowY": "auto",
    "bgcolor": "rgba(47, 113, 100, 0.9)",
    "border": "none",
    "boxShadow": 24,
    "p": 4,
    "outline": "none",
    "& a": {
        color: "#CCC"
    },
    "@media (max-width: 1280px)": {
        maxWidth: "600px",
        maxHeight: "80vh"
    }
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
                <Typography id="modal-modal-title" variant="h4" component="h1" sx={{ textAlign: "center", mb: 3 }}>
                    <b>Inflation Reduction Act Conservation; Policy Design Lab</b>
                </Typography>
                <Typography id="modal-modal-description" sx={{ my: 2 }}>
                    On August 16, 2022, President Joe Biden signed into law the Inflation Reduction Act of 2022 (P.L.
                    <a
                        target="_blank"
                        href="https://www.congress.gov/bill/117th-congress/house-bill/5376/text"
                        rel="noreferrer"
                    >
                        117-169
                    </a>
                    ). Among other things, the Inflation Reduction Act (IRA) included an $18 billion investment of
                    additional funds appropriated to four Farm Bill Conservation programs: Environmental Quality
                    Incentives Program (
                    <a
                        target="_blank"
                        href="https://farmdocdaily.illinois.edu/2023/04/a-view-of-the-farm-bill-through-policy-design-part-1-eqip.html"
                        rel="noreferrer"
                    >
                        EQIP
                    </a>
                    ); Conservation Stewardship Program (
                    <a
                        target="_blank"
                        href="https://farmdocdaily.illinois.edu/2023/05/a-view-of-the-farm-bill-through-policy-design-part-2-csp.html"
                        rel="noreferrer"
                    >
                        CSP
                    </a>
                    ); Agricultural Conservation Easement Program (
                    <a
                        target="_blank"
                        href="https://farmdocdaily.illinois.edu/2023/10/a-view-of-the-farm-bill-through-policy-design-part-7-acep-and-rcpp.html"
                        rel="noreferrer"
                    >
                        ACEP
                    </a>
                    ); and Regional Conservation Partnership Program (
                    <a
                        target="_blank"
                        href="https://farmdocdaily.illinois.edu/2023/10/a-view-of-the-farm-bill-through-policy-design-part-7-acep-and-rcpp.html"
                        rel="noreferrer"
                    >
                        RCPP
                    </a>
                    ). Technically, Congress appropriated specific additional funding for each program which is known as
                    Budget Authority (BA). The funds appropriated are available to USDA to spend on conservation
                    practice assistance to farmers. Importantly, Congress limited the use of the funds for only those
                    conservation practices that USDA determined “directly improve soil carbon, reduce nitrogen losses,
                    or reduce, capture, avoid, or sequester carbon dioxide, methane, or nitrous oxide emissions,
                    associated with agricultural production” (P.L.{" "}
                    <a
                        target="_blank"
                        href="https://www.congress.gov/bill/117th-congress/house-bill/5376/text"
                        rel="noreferrer"
                    >
                        117-169
                    </a>
                    ).
                </Typography>
                <Typography id="modal-modal-description" sx={{ my: 2 }}>
                    The IRA funding provides a policy design case study because Congress both added new funding and
                    limited the practices for which the additional funds could be used. It will allow for a comparison
                    of Farm Bill and IRA fund allocations based eligible practices because Farm Bill funds include, but
                    are not limited to, the subset of practices eligible for IRA funds. This page is being developed to
                    provide analysis of conservation policies under different scenarios for funding and eligible
                    practices, using the data reported by USDA&apos;s Natural Resources Conservation Service (NRCS:{" "}
                    <a
                        target="_blank"
                        href="https://www.nrcs.usda.gov/resources/data-and-reports/rca-data-viewer"
                        rel="noreferrer"
                    >
                        RCA Data Viewer
                    </a>
                    ). Analysis begins with the allocation of IRA funds by NRCS for Fiscal Year (FY) 2023. An initial
                    projection for the allocation among the States is provided based on the entire Budget Authority (BA)
                    for the program in the IRA and the FY2023 allocation. Note that BA is the total amount appropriated
                    by Congress and available to be spent by USDA.
                </Typography>
                <Typography id="modal-modal-description" sx={{ my: 2 }}>
                    Future developments on this page will permit visualizations and analysis of alternative projections,
                    such as the amount projected to be spent from IRA funds that are reported by the Congressional
                    Budget Office (CBO) and are known as outlays. CBO generally projects spending over 10 years into the
                    future in what is known as a baseline (CBO:{" "}
                    <a
                        target="_blank"
                        href="https://www.cbo.gov/data/baseline-projections-selected-programs"
                        rel="noreferrer"
                    >
                        Details About Baseline Projections for Selected Programs
                    </a>
                    ). CBO&apos;s most recent baseline projections were released in June 2024 (CBO:{" "}
                    <a
                        target="_blank"
                        href="https://www.cbo.gov/system/files/2024-06/51317-2024-06-usda.pdf"
                        rel="noreferrer"
                    >
                        USDA Mandatory Farm Programs
                    </a>
                    ). Future releases will allow visualizations based on these and other projections, as well as
                    updated reporting on actual spending as reported by USDA. For all visualizations, users will be able
                    to select allocations by State and conservation practice, as well as by selecting multiple
                    conservation practices.
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
