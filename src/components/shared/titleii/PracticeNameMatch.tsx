const PracticeNameMatch = (practiceName: string) => {
    if (!practiceName.includes('(')) {
        return practiceName;
    }
    // The outermost parentheses are captured, and everything inside those parentheses got returned
    const match = practiceName.match(/\(([^()]+(?:\([^()]*\))?[^()]*)\)$/);
    return match ? match[1] : null;
};
export default PracticeNameMatch;
