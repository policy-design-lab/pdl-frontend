export async function getJsonDataFromUrl(url) {
    const response = await fetch(url, { method: "GET", mode: "cors" });
    if (response.status === 200) {
        return response.json();
    }
    return [];
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
