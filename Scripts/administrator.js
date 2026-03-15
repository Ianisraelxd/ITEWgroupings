// Administrator class that extends the User class, with additional properties and methods for managing teachers and students.
class Administrator extends User {
    constructor(accountId, firstName, lastName, password = "admin123") {

        super(accountId, firstName, lastName, password, "Administrator");

        this.managedTeachers = [];
        this.managedStudents = [];
    }

    // Method to add a teacher to the administrator's managed teachers list and save the teacher's data.
    addTeacher(teacher) {
        teacher.save();
        if (!this.managedTeachers.includes(teacher.accountId)) {
            this.managedTeachers.push(teacher.accountId); // Add the teacher's account ID to the managed teachers list if it's not already there.
        }
        this.save();
    }

    // Method to add a student to the administrator's managed students list and save the student's data.
    addStudent(student) {
        student.save();
        if (!this.managedStudents.includes(student.accountId)) {
            this.managedStudents.push(student.accountId); // Add the student's account ID to the managed students list if it's not already there.
        }
        this.save();
    }

    // Method to remove a user (teacher or student) from local storage based on their account ID.
    removeUser(accountId) {
        const users = User.getAllFromStorage();
        delete users[accountId];
        localStorage.setItem("users", JSON.stringify(users)); // Update local storage with the modified users object.
    }

    // Method to clear all data from local storage after confirming with the user.
    clearAllData() {
        if (confirm("Clear ALL data?")) {
            localStorage.clear(); // Clear all data from local storage.
        }
    }
}