class Student extends User {
    // Initialize a student with account details and an optional list of subjects
    constructor(accountId, firstName, lastName, password, subjects = []) {
        super(accountId, firstName, lastName, password, "Student", subjects);
        this.grades = {};
        this.attendance = [];
    }
    // Add a grade for a specific subject
    addGrade(subject, grade) {
        if (grade < 0 || grade > 100) {
            throw new Error("Grade must be 0-100"); // Validate grade input
        }
        this.grades[subject] = grade;
        this.save(); // Save the updated student data
    }
    // Get the average grade across all subjects
    getAverageGrade() {
        const values = Object.values(this.grades);
        if (!values.length) {
            return 0;
        }
        // Calculate the average and round to 2 decimal places
        return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    }
}