class Teacher extends User {

    constructor(accountId, firstName, lastName, password, subjects = []) {

        super(accountId, firstName, lastName, password, "Teacher", subjects);

        this.sections = [];
        this.students = [];
    }

    assignSection(sectionName) {

        if (!this.sections.includes(sectionName)) {

            this.sections.push(sectionName);
            this.save();
        }
    }

    assignStudent(studentId) {

        if (!this.students.includes(studentId)) {

            this.students.push(studentId);
            this.save();
        }
    }
}