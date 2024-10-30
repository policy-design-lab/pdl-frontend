# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [unreleased]

### Changed
- Updated the front-end code to fit the new landing page data from database [#334](https://github.com/policy-design-lab/pdl-frontend/issues/334) 

## [1.2.0] - 2024-10-24

### Added
- Add selector to the landing page total map for users to select the program they want to see and get the total amount of the selected programs in the map [#317](https://github.com/policy-design-lab/pdl-frontend/issues/317) 

## [1.1.0] - 2024-10-04

### Changed
- Updated the CRP page to use the latest data structure from the API endpoint [#320](https://github.com/policy-design-lab/pdl-frontend/issues/320) 
- Updated the ACEP and RCPP page to use the latest data from the API endpoint [#322](https://github.com/policy-design-lab/pdl-frontend/issues/322) 
- Updated the Crop Insurance page to use the latest data from the API endpoint [#324](https://github.com/policy-design-lab/pdl-frontend/issues/324) 
- Replaced the treemap on the ACEP page with the table [#325](https://github.com/policy-design-lab/pdl-frontend/issues/325) 

## [1.0.5] - 2024-08-28

### Added
- Added the CSP session to the IRA page [#299](https://github.com/policy-design-lab/pdl-frontend/issues/299) 
- Improved the map legend to cover more maps on the IRA page [#313](https://github.com/policy-design-lab/pdl-frontend/issues/313) 

## [1.0.4] - 2024-08-16

### Added
- Added the top info session for IRA page [#309](https://github.com/policy-design-lab/pdl-frontend/issues/309) 
- Added "Other CSP" statues and related categories to the CSP pages [#303](https://github.com/policy-design-lab/pdl-frontend/issues/303) 
- Added null value handling for the latest CSP data [#301](https://github.com/policy-design-lab/pdl-frontend/issues/301) 

### Changed
- Changed the "Other Improvement" in the EQIP page categories to "Other Improvements" [#311](https://github.com/policy-design-lab/pdl-frontend/issues/311) 
- Updated CSP category list to match latest data [#305](https://github.com/policy-design-lab/pdl-frontend/issues/305) 
- Updated the color legends for the EQIP and CSP maps to match latest data [#304](https://github.com/policy-design-lab/pdl-frontend/issues/304) 

## [1.0.3] - 2024-08-01

### Fixed
- Block the EQIP IRA information modal from opening automatically when the page loads due to the size of the article's iframe. [#306](https://github.com/policy-design-lab/pdl-frontend/issues/306) 

## [1.0.2] - 2024-07-23

### Fixed
- Fixed the occasional bug where the IRA page failed to load because the summary data was not ready [#293](https://github.com/policy-design-lab/pdl-frontend/issues/293) 


## [1.0.1] - 2024-07-19

### Added
- Added the percentage display into the EQIP IRA map tips [#285](https://github.com/policy-design-lab/pdl-frontend/issues/285) 

### Changed
- Update the practice list to reflect current and predicted practices for EQIP IRA[#286](https://github.com/policy-design-lab/pdl-frontend/issues/286) 

### Fixed
- Fixed the NaN values in percentage table in the EQIP IRA page [#290](https://github.com/policy-design-lab/pdl-frontend/issues/290) 

## [1.0.0] - 2024-07-03

### Added
- Added the IRA page with the EQIP section to display 2023 data and predicted 2024-2031 data with total dollar amount and practice options [#268](https://github.com/policy-design-lab/pdl-frontend/issues/268) 

## [0.20.0] - 2024-06-03

### Changed
- Updated landing page map to reflect new top-line numbers [#272](https://github.com/policy-design-lab/pdl-frontend/issues/272) 

## [0.19.0] - 2024-05-09

### Added
- Added anchors to issues/white papers items for them to have a distinct url [#278](https://github.com/policy-design-lab/pdl-frontend/issues/278)

## [0.18.0] - 2024-05-07

### Added
- Added a new white paper to the Issue/White Paper page [#262](https://github.com/policy-design-lab/pdl-frontend/issues/262)

### Changed
- Removed the copyright section on the Policy Lab page [#263](https://github.com/policy-design-lab/pdl-frontend/issues/263) 
- Changed the '_' in the URLs of Issue/White Paper page and Policy Lab page to '-' [#266](https://github.com/policy-design-lab/pdl-frontend/issues/266) 

## [0.17.0] - 2024-04-09

### Added
- Added Predetermined Prediction (Policy Lab) page to include an iframe for Surface 51's model [#260](https://github.com/policy-design-lab/pdl-frontend/issues/260)

## [0.16.0] - 2024-02-22

### Added
- Title I page added the total subsection based on the summary data for landing page [#239](https://github.com/policy-design-lab/pdl-frontend/issues/239)
- Title II page added the total subsection based on the summary data for landing page [#253](https://github.com/policy-design-lab/pdl-frontend/issues/253)
- Added sub title in nav bar for the Title I and Crop Insurance Page [#255](https://github.com/policy-design-lab/pdl-frontend/issues/255)

### Changed
- Updated Title I, Title II and Crop Insurance pages to use new API endpoints [#249](https://github.com/policy-design-lab/pdl-frontend/issues/249) 
- Updated the SNAP page to use new API endpoints [#257](https://github.com/policy-design-lab/pdl-frontend/issues/257) 
- Revised the EQIP and CSP code to follow the same pattern as new pages, allowing `map` endpoint to retire [#249](https://github.com/policy-design-lab/pdl-frontend/issues/249) 
- Removed the 'Other Conservation' section out of Title II menu [#256](https://github.com/policy-design-lab/pdl-frontend/issues/256)

### Fixed
- Removed the `$` in total policies earning premium section at the Crop Insurance page [#252](https://github.com/policy-design-lab/pdl-frontend/issues/252) 

## [0.15.0] - 2024-02-09

### Added
- Added `paymentPercentageNationwide` to Title I page map tooltips and tables [#238](https://github.com/policy-design-lab/pdl-frontend/issues/238) 

### Changed
- Changed 'Payments' to 'Benefits' for the Crop Insurance map on landing page [#240](https://github.com/policy-design-lab/pdl-frontend/issues/240)
- Changed all 'Costs' for the SNAP program to 'Benefits' across the website [#241](https://github.com/policy-design-lab/pdl-frontend/issues/241)
- Updated Title I page to use the revised API endpoints [#243](https://github.com/policy-design-lab/pdl-frontend/issues/243)

## [0.14.0] - 2024-01-17

### Changed
- Based on the usability testing result, adjusted all tables to have a similar header style[#233](https://github.com/policy-design-lab/pdl-frontend/issues/233)
- Based on the usability testing result, adjusted the pie chart color at Conservation pages[#230](https://github.com/policy-design-lab/pdl-frontend/issues/230)
- Based on the usability testing result, adjusted the side menu style at Conservation pages[#229](https://github.com/policy-design-lab/pdl-frontend/issues/229)
- Based on the usability testing result, adjusted tooltip styles for all maps [#232](https://github.com/policy-design-lab/pdl-frontend/issues/232)

### Fixed
- Fixed the loss ratio representation at crop insurance page [#225](https://github.com/policy-design-lab/pdl-frontend/issues/225)
- Changed Google Analytics plugin from `react-ga` module to script and use webpack environmental variable to config [#226](https://github.com/policy-design-lab/pdl-frontend/issues/226)

## [0.13.0] - 2023-12-14

### Added
- Added Google Analytics using `react-ga` module to page router [#217](https://github.com/policy-design-lab/pdl-frontend/issues/217)

### Changed
- Updated all maps to show exact number of dollars instead of rounding units to the nearest million [#137](https://github.com/policy-design-lab/pdl-frontend/issues/137)
- Replaced the arrow of table to Material UI icons to show in Linux browser[#151](https://github.com/policy-design-lab/pdl-frontend/issues/151)

## [0.12.0] - 2023-11-17

### Added
- Add the issue release/white paper page [#210](https://github.com/policy-design-lab/pdl-frontend/issues/210)
- Add iFrame component to the release/white paper page [#214](https://github.com/policy-design-lab/pdl-frontend/issues/214)

## [0.11.0] - 2023-11-08

### Added
- Dairy Margin Coverage page and Supplemental Agricultural Disaster Assistance page with corresponding components for their attributes [#206](https://github.com/policy-design-lab/pdl-frontend/issues/206)

### Changed
- Optimize webpack config to save docker building time [#203](https://github.com/policy-design-lab/pdl-frontend/issues/203)
- Change PDL logo to use the new design [#209](https://github.com/policy-design-lab/pdl-frontend/issues/209)

## [0.10.0] - 2023-10-17

### Added
- ACEP page and corresponding components for its attributes [#200](https://github.com/policy-design-lab/pdl-frontend/issues/200)
- RCPP page and corresponding components for its attributes [#196](https://github.com/policy-design-lab/pdl-frontend/issues/196)

### Changed
- Reverse some unnecessary changes in EQIP, CSP and CRP table [#199](https://github.com/policy-design-lab/pdl-frontend/issues/199)

### Fixed
- Adjust program drawer to remove over-length scroll bar in Chrome/Firefox [#198](https://github.com/policy-design-lab/pdl-frontend/issues/198)

## [0.9.0] - 2023-09-18

### Added
- CRP page and corresponding components for its attributes [#170](https://github.com/policy-design-lab/pdl-frontend/issues/170)

### Changed
- Replace the color legends on the EQIP, CSP, and CRP pages with the customized scheme [189](https://github.com/policy-design-lab/pdl-frontend/issues/189)
- Adjusted the menu height of CRP page on small screen [#190](https://github.com/policy-design-lab/pdl-frontend/issues/190)

### Fixed
- The tables for Title II shows right most column in any screen size [#192](https://github.com/policy-design-lab/pdl-frontend/issues/192)

## [0.8.0] - 2023-09-06

### Added
- Add Crop Insurance page and corresponding components for its attributes [#125](https://github.com/policy-design-lab/pdl-frontend/issues/125)
- Added Average Insured Area In Acres sub-page to Crop Insurance pages [#183](https://github.com/policy-design-lab/pdl-frontend/issues/183)

### Changed
- Use different title equations for the bar charts in pages under the Net Farmer Benefit section [#179](https://github.com/policy-design-lab/pdl-frontend/issues/179)
- Adjusted font size of chart headers on Crop Insurance page [#182](https://github.com/policy-design-lab/pdl-frontend/issues/182)
- Adjusted '$' sign for some sub-pages of Crop Insurance page [#184](https://github.com/policy-design-lab/pdl-frontend/issues/184)
- Adjusted menu height of Crop Insurance page [#185](https://github.com/policy-design-lab/pdl-frontend/issues/185)
- Added explanation to the Insured Acres subpage of Crop Insurance page [#186](https://github.com/policy-design-lab/pdl-frontend/issues/186)


## [0.7.0] - 2023-08-22

### Changed
- Landing page clean up for use API endpoint by removing redundant calls [#148](https://github.com/policy-design-lab/pdl-frontend/issues/148)
- CSP page uses API endpoint instead of local json file [#149](https://github.com/policy-design-lab/pdl-frontend/issues/149)
- SNAP page landing page uses API endpoint following the pattern in Landing Page [#166](https://github.com/policy-design-lab/pdl-frontend/issues/166)
- Updated the year related labels on landing page and title 1 page to reflect changes of new title 1 API [#168](https://github.com/policy-design-lab/pdl-frontend/issues/168)
- Updated the landing page map tab to include a label to explain that the top-line numbers are not finalized [#171](https://github.com/policy-design-lab/pdl-frontend/issues/171)
- Added '(Numbers have not yet been finalized)' label on landing page top line tab and updated several details on Title 1 page [#172](https://github.com/policy-design-lab/pdl-frontend/issues/172)
- Changed the "Total Commodities Programs" on the Title I page menu to "Total Commodities Programs, Subtitle A" [#176](https://github.com/policy-design-lab/pdl-frontend/issues/176)

## [0.6.0] - 2023-07-18

### Added
- Add Title 1 page and corresponding components for the Conservation Programs [#126](https://github.com/policy-design-lab/pdl-frontend/issues/126)

### Changed
- EQIP page updated to use the data from API endpoint [#132](https://github.com/policy-design-lab/pdl-frontend/issues/132)
- Reverse the 'm' back to 'k' in the data formatting function for thousands [#145](https://github.com/policy-design-lab/pdl-frontend/issues/145)
- Add `$` sign to the beginning of legend bar on landing page [#141](https://github.com/policy-design-lab/pdl-frontend/issues/141)
- Add search bar area and update color theme of EQIP and CSP pages
- Update Title 1 navigation bar title [#156](https://github.com/policy-design-lab/pdl-frontend/issues/156)
- Add year to the titles of map in the EQIP page and CSP page [#158](https://github.com/policy-design-lab/pdl-frontend/issues/158)
- Remove the arrow in navigation search bar [#159](https://github.com/policy-design-lab/pdl-frontend/issues/159)

## [0.5.1] - 2023-05-30

### Changed
- Change the format of negative values in landing page maps' tips and legend bar to fit client's request
- Modify the title of each map's tip to match each program

## [0.5.0] - 2023-05-26

### Added
- Add dynamic color bar for landing page and SNAP page [#121](https://github.com/policy-design-lab/pdl-frontend/issues/121)
- New GitHub issue templates. [#127](https://github.com/policy-design-lab/pdl-frontend/issues/127)  

### Changed
- Landing page maps & tabs use api endpoints instead of local json files [#110](https://github.com/policy-design-lab/pdl-frontend/issues/110)
- Add crop insurance tab back to landing page [#130](https://github.com/policy-design-lab/pdl-frontend/issues/130)
- Removed the duplicate 'AllProgramMap' component on the landing page. Instead, modified the 'LandingPageMap' component to include the all-program map

### Removed
- Previously used default GitHub issue template. [#127](https://github.com/policy-design-lab/pdl-frontend/issues/127)

## [0.4.0] - 2023-05-10

### Added
- SNAP page and connected to SNAP API Point [#59](https://github.com/policy-design-lab/pdl-frontend/issues/59)
- Local development work environment to connect dev api server [#93](https://github.com/policy-design-lab/pdl-frontend/issues/93/)
- CSP page [#74](https://github.com/policy-design-lab/pdl-frontend/issues/74)

### Changed
- eslint rules back to original [#94](https://github.com/policy-design-lab/pdl-frontend/issues/94)

## [0.3.0] - 2023-05-03

### Added
- Popup alert for unfinished programs [#58](https://github.com/policy-design-lab/pdl-frontend/issues/58)
- Navigation from PDL title and PDL logo [#51](https://github.com/policy-design-lab/pdl-frontend/issues/51)
- Icon for left menu [#62](https://github.com/policy-design-lab/pdl-frontend/issues/62)
- Background color for selected columns in table [#68](https://github.com/policy-design-lab/pdl-frontend/issues/68)

### Changed
- Landing page uses the api endpoint for AllProgram Maps [#20](https://github.com/policy-design-lab/pdl-frontend/issues/20)- Table sorting icon [#55](https://github.com/policy-design-lab/pdl-frontend/issues/55)
- Landing page text display for each different tab selection [#53](https://github.com/policy-design-lab/pdl-frontend/issues/53)
- The left menu margin and background color [#61](https://github.com/policy-design-lab/pdl-frontend/issues/61)
- Number style for semi-donut chart [#64](https://github.com/policy-design-lab/pdl-frontend/issues/64)
- Popup menu styles [#66](https://github.com/policy-design-lab/pdl-frontend/issues/66)
- Table styles [#76](https://github.com/policy-design-lab/pdl-frontend/issues/76)
- Updated EQIP JSON data files. [#84](https://github.com/policy-design-lab/pdl-frontend/issues/84)
- Map legends and EQIP popper text [#91](https://github.com/policy-design-lab/pdl-frontend/issues/91)
- color schemes back and hid crop insurance tab for release 0.3.0 [#105](https://github.com/policy-design-lab/pdl-frontend/issues/105)

### Fixed
- Table sorting functions [#49](https://github.com/policy-design-lab/pdl-frontend/issues/49)
- Dynamic api uri creation [#78](https://github.com/policy-design-lab/pdl-frontend/issues/78)
- Tooltip styles for semi donut chart [#80](https://github.com/policy-design-lab/pdl-frontend/issues/80)
- Number format shown on map when hovering [#82](https://github.com/policy-design-lab/pdl-frontend/issues/82)
- Errors in the EQIP JSON data files. [#87](https://github.com/policy-design-lab/pdl-frontend/issues/87)

## [0.2.0] - 2023-03-03

### Added
- Initial EQIP page and data visualization demos [#18](https://github.com/policy-design-lab/pdl-frontend/issues/18)
- EQIP maps and functional semi-donut charts, and data tables [#27](https://github.com/policy-design-lab/pdl-frontend/issues/27)
- Average monthly participation data to SNAP map hover. [#28](https://github.com/policy-design-lab/pdl-frontend/issues/28)
- Navigation for HOME button [#42](https://github.com/policy-design-lab/pdl-frontend/issues/42)

### Changed
- Pop-up menu styles [#36](https://github.com/policy-design-lab/pdl-frontend/issues/36)
- Option text styles [#40](https://github.com/policy-design-lab/pdl-frontend/issues/40)
- Update SNAP data in summary and allPrograms JSON files based on latest data and recalculate total dollar amounts. [#44](https://github.com/policy-design-lab/pdl-frontend/issues/44)
- Update EQIP JSON files with the latest data. [#31](https://github.com/policy-design-lab/pdl-frontend/issues/31) 

### Fixed
- Debugger was not evaluating breakpoints because a configuration was missing [#24](https://github.com/policy-design-lab/pdl-frontend/issues/24)
- Semi donut 6a display with the overlapping text [#34](https://github.com/policy-design-lab/pdl-frontend/issues/34)
- Format of the semi-donut EQIP benefits number [#38](https://github.com/policy-design-lab/pdl-frontend/issues/38)

## [0.1.0] - 2023-01-23

### Added
- Initial landing page from template [#2](https://github.com/policy-design-lab/pdl-frontend/issues/2)
- Interactive landing page maps for different programs [#3](https://github.com/policy-design-lab/pdl-frontend/issues/3)
- GitHub action and Dockerfile to build frontend [#5](https://github.com/policy-design-lab/pdl-frontend/issues/5)

### Changed
- Landing page context and color palette for maps [#7](https://github.com/policy-design-lab/pdl-frontend/issues/7)
- Landing page details(colors, etc) based on figma design [#9](https://github.com/policy-design-lab/pdl-frontend/issues/9)
- Map data json [#12](https://github.com/policy-design-lab/pdl-frontend/issues/12)
- Final landing page changes for initial milestone [#15](https://github.com/policy-design-lab/pdl-frontend/issues/15)

[1.2.0]: https://github.com/policy-design-lab/pdl-frontend/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/policy-design-lab/pdl-frontend/compare/1.0.5...1.1.0
[1.0.5]: https://github.com/policy-design-lab/pdl-frontend/compare/1.0.4...1.0.5
[1.0.4]: https://github.com/policy-design-lab/pdl-frontend/compare/1.0.3...1.0.4
[1.0.3]: https://github.com/policy-design-lab/pdl-frontend/compare/1.0.2...1.0.3
[1.0.2]: https://github.com/policy-design-lab/pdl-frontend/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/policy-design-lab/pdl-frontend/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.20.0...1.0.0
[0.20.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.19.0...0.20.0
[0.19.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.18.0...0.19.0
[0.18.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.17.0...0.18.0
[0.17.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.16.0...0.17.0
[0.16.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.15.0...0.16.0
[0.15.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.14.0...0.15.0
[0.14.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.13.0...0.14.0
[0.13.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.12.0...0.13.0
[0.12.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.11.0...0.12.0
[0.11.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.10.0...0.11.0
[0.10.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.9.0...0.10.0
[0.9.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.8.0...0.9.0
[0.8.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.7.0...0.8.0
[0.7.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.6.0...0.7.0
[0.6.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.5.1...0.6.0
[0.5.1]: https://github.com/policy-design-lab/pdl-frontend/compare/0.5.0...0.5.1
[0.5.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.4.0...0.5.0
[0.4.0]: https://github.com/policy-design-lab/pdl-frontend/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/policy-design-lab/pdl-api/releases/tag/0.3.0
