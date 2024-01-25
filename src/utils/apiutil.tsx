export async function getJsonDataFromUrl(url) {
    const response = await fetch(url, { method: "GET", mode: "cors" });
    if (response.ok) {
        const responseBody = await response.text();
        if (isJSON(responseBody)) {
            try {
                return JSON.parse(responseBody);
            } catch (error) {
                console.error(responseBody);
                throw new Error(
                    "Error parsing JSON!! You either not set up environment variable correctly, or your are not fetching json"
                );
            }
        } else {
            console.error(
                "Response body is not json!! You either not set up environment variable correctly, or your are not fetching json"
            );
            console.error(responseBody);
            return [];
        }
    }
    console.error(`Error fetching data. Status: ${response.status}`);
    throw new Error(`Error fetching data. Status: ${response.status}`);
}

export function convertAllState(inlist) {
    // create a json looking string out of the Json list
    let conv_str = inlist.reduce((result, element) => {
        return `${result}"${element.code}": "${element.name}", `;
    }, "");

    // remove the very last space and comma
    conv_str = `{ ${conv_str.substring(0, conv_str.length - 2)} }`;

    return JSON.parse(conv_str);
}

export const getValueFromAttrDollar = (stateRecord, attribute): string => {
    let ans = "";
    if (attribute) {
        Object.keys(stateRecord).forEach((key) => {
            const match = key.toLowerCase().match(/(.*?)(?=\s*indollars)/);
            const extractedKey = match ? match[1] : "";
            if (extractedKey.includes(attribute)) {
                ans = key;
            }
        });
    }
    return ans;
};

export const getValueFromAttrPercentage = (stateRecord, attribute): string => {
    let ans = "";
    Object.keys(stateRecord).forEach((key) => {
        const match = key.toLowerCase().match(/(.*?)(?=\s*inpercentagenationwide)/);
        const extractedKey = match ? match[1] : "";
        if (extractedKey.includes(attribute)) {
            ans = key;
        }
    });
    return ans;
};

function isJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}
