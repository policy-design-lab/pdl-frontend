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
                    The IRA funding provides a policy design case study because Congress both added funding and limited
                    the use of that funding, offering a comparison with the same programs with different funding levels
                    provided by Congress in the Farm Bill and for more practices. Farm Bill funds for these conservation
                    programs include, but are not limited to, the subset of practices that are eligible for IRA funds.
                    The following provides analysis of these conservation policies under the different scenarios of
                    funding and eligible practices, using the data reported by USDA’s Natural Resources Conservation
                    Services (NRCS:{" "}
                    <a
                        target="_blank"
                        href="https://www.nrcs.usda.gov/resources/data-and-reports/rca-data-viewer"
                        rel="noreferrer"
                    >
                        RCA Data Viewer
                    </a>
                    ). The information visualized below applies the allocation of funds by NRCS for Fiscal Year (FY)
                    2023, the first year of the IRA appropriations, to the total Budget Authority to project the
                    allocations by State and conservation practices. Users can select multiple practices to provide
                    comparisons and performance analysis.
                </Typography>
                <Typography id="modal-modal-description" sx={{ my: 2 }}>
                    In addition to the Budget Authority, or the amount appropriated by Congress and available to be
                    spent by USDA, the Congressional Budget Office (CBO) also projects the amount of spending from that
                    BA, which is known as the outlays. CBO projects spending amounts through FY2034 and the amount is
                    known as the baseline (CBO:{" "}
                    <a
                        target="_blank"
                        href="https://www.cbo.gov/data/baseline-projections-selected-programs"
                        rel="noreferrer"
                    >
                        Details About Baseline Projections for Selected Programs
                    </a>
                    ). CBO’s most recent baseline projections were released in June 2024 (CBO:{" "}
                    <a
                        target="_blank"
                        href="https://www.cbo.gov/system/files/2024-06/51317-2024-06-usda.pdf"
                        rel="noreferrer"
                    >
                        USDA Mandatory Farm Programs
                    </a>
                    ). Similar as with BA, users can select visualizations and analysis of the IRA projected outlays by
                    State and conservation practice.
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
