# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

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

[unreleased]: https://github.com/policy-design-lab/pdl-frontend/compare/0.5.1...HEAD
[0.5.1]: https://github.com/policy-design-lab/pdl-frontend/compare/0.5.0...0.5.1
[0.5.0]: https://github.com/policy-design-lab/pdl-frontend/tag/0.5.0
