const getCsvData = (headerGroups, data) => {
        if (!data || !data.length) {
            return [];
        }
        const csvData = [
            headerGroups[0].headers.map((column) => column.render("Header")),
            ...data.map((row) => {
                if (!row) {
                    return [];
                }
                return Object.entries(row).map(([key, cell]) => {
                    return cell || "";
                });
            })
        ];
        return csvData;
    };

export default getCsvData;
