// Teacher class extending User
class Teacher extends User {
    // Constructor to initialize teacher properties
    constructor(accountId, firstName, lastName, password, subjects = []) {
        super(accountId, firstName, lastName, password, "Teacher", subjects); // Call the parent class constructor
        this.sections = [];
        this.students = [];
    }
    
    // Method to assign a section to the teacher
    assignSection(sectionName) {
        if (!this.sections.includes(sectionName)) {
            this.sections.push(sectionName); // Add section name to the teacher's list of sections
            this.save();
        }
    }

    // Method to assign a student to the teacher
    assignStudent(studentId) {
        if (!this.students.includes(studentId)) {
            this.students.push(studentId); // Add student ID to the teacher's list of students
            this.save();
        }
    }
}
