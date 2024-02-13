import fs from 'fs';

// For reference, here are the state FIPS codes:
// No 7, 14, 43, or 52...? And why DC? Its so smol🙃

const fipsStateCodes = {
    "Alabama": "01",
    "Alaska": "02",
    "Arizona": "04",
    "Arkansas": "05",
    "California": "06",
    "Colorado": "08",
    "Connecticut": "09",
    "Delaware": "10",
    "District of Columbia": "11",
    "Florida": "12",
    "Georgia": "13",
    "Hawaii": "15",
    "Idaho": "16",
    "Illinois": "17",
    "Indiana": "18",
    "Iowa": "19",
    "Kansas": "20",
    "Kentucky": "21",
    "Louisiana": "22",
    "Maine": "23",
    "Maryland": "24",
    "Massachusetts": "25",
    "Michigan": "26",
    "Minnesota": "27",
    "Mississippi": "28",
    "Missouri": "29",
    "Montana": "30",
    "Nebraska": "31",
    "Nevada": "32",
    "New Hampshire": "33",
    "New Jersey": "34",
    "New Mexico": "35",
    "New York": "36",
    "North Carolina": "37",
    "North Dakota": "38",
    "Ohio": "39",
    "Oklahoma": "40",
    "Oregon": "41",
    "Pennsylvania": "42",
    "Rhode Island": "44",
    "South Carolina": "45",
    "South Dakota": "46",
    "Tennessee": "47",
    "Texas": "48",
    "Utah": "49",
    "Vermont": "50",
    "Virginia": "51",
    "Washington": "53",
    "West Virginia": "54",
    "Wisconsin": "55",
    "Wyoming": "56",
};

// Read the JSON file
fs.readFile('assets/json/counties-10m.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    // Parse the JSON data
    const yourJsonObject = JSON.parse(data);

    // Separate geometries based on the "id" property
    const geometriesStartingWithPrefix = [];
    const otherGeometries = [];

    yourJsonObject.objects.counties.geometries.forEach(geometry => {
        // Check if the "id" property starts with 17, 19, or 55
        const idStartsWith = ['17', '19'];
        if (idStartsWith.some(prefix => geometry.id.toString().startsWith(prefix))) {
            geometriesStartingWithPrefix.push(geometry);
        } else {
            otherGeometries.push(geometry);
        }
    });

    // Concatenate the arrays to preserve the order
    const rearrangedGeometries = otherGeometries.concat(geometriesStartingWithPrefix);

    // Create a new object with the rearranged geometries
    const rearrangedJsonObject = {
        ...yourJsonObject,
        objects: {
            ...yourJsonObject.objects,
            counties: {
                ...yourJsonObject.objects.counties,
                geometries: rearrangedGeometries,
            },
        },
    };


    const filename = '../files/new-geo-states.json';

    // Write the filtered data to a new JSON file
    fs.writeFile(filename, JSON.stringify(rearrangedJsonObject, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to the file:', err);
            return;
        }
        console.log('Filtered data has been written to:', filename);
    });
});
