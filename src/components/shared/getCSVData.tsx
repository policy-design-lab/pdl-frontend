const getCSVData = (headerGroups, data) => {
    if (!data || !data.length) {
        return [];
    }
    const headers = headerGroups[0].headers;
    const csvData = [
        headers.map((column) => column.render("Header")),
        ...data.map((row) => {
            if (!row) {
                return [];
            }
            return headers.map((column) => {
                const value = row[column.id] || "";
                return value;
            });
        })
    ];
    return csvData;
};

export default getCSVData;
