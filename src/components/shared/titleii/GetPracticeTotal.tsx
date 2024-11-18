const getPracticeTotal = (record, practiceName) => {
    if (!record || !record.statutes) return 0;
    if (practiceName === "All Practices") {
        return record.totalPaymentInDollars || 0;
    }
    const codeMatch = practiceName.match(/\((\d+)\)$/);
    const practiceCode = codeMatch ? codeMatch[1] : null;
    const practiceName_noCode = practiceName.replace(/\s*\(\d+\)$/, "");
    let total = 0;
    record.statutes?.forEach((statute) => {
        if (!statute.practiceCategories) return;
        statute.practiceCategories.forEach((category) => {
            if (practiceName_noCode === category.practiceCategoryName) {
                total += category.totalPaymentInDollars || 0;
                return;
            }

            if (practiceCode && Array.isArray(category.practices) && category.practices.length > 0) {
                category.practices.forEach((practice) => {
                    const currentPracticeCode = practice.practiceName?.match(/\((\d+)\)$/)?.[1];
                    if (currentPracticeCode === practiceCode) {
                        total += practice.totalPaymentInDollars || 0;
                    }
                });
            }
        });
    });
    return total;
};

export default getPracticeTotal;
