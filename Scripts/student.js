class Student extends User {

    constructor(accountId, firstName, lastName, password, subjects = []) {

        super(accountId, firstName, lastName, password, "Student", subjects);

        this.grades = {};
        this.attendance = [];
    }

    addGrade(subject, grade) {

        if (grade < 0 || grade > 100)
            throw new Error("Grade must be 0-100");

        this.grades[subject] = grade;

        this.save();
    }

    getAverageGrade() {

        const values = Object.values(this.grades);

        if (!values.length) return 0;

        return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    }
}