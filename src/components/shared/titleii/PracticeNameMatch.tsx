const PracticeNameMatch = (practiceName: string) => {
    if (/^[A-Z]+$/.test(practiceName)) {
        return practiceName;
    }
    const match = practiceName.match(/\(([^)]+)\)$/);
    return match ? match[1] : null;
};
export default PracticeNameMatch;
