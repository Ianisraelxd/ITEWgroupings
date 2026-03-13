class Administrator extends User {

    constructor(accountId, firstName, lastName, password = "admin123") {

        super(accountId, firstName, lastName, password, "Administrator");

        this.managedTeachers = [];
        this.managedStudents = [];
    }

    addTeacher(teacher) {

        teacher.save();

        if (!this.managedTeachers.includes(teacher.accountId)) {

            this.managedTeachers.push(teacher.accountId);
        }

        this.save();
    }

    addStudent(student) {

        student.save();

        if (!this.managedStudents.includes(student.accountId)) {

            this.managedStudents.push(student.accountId);
        }

        this.save();
    }

    removeUser(accountId) {

        const users = User.getAllFromStorage();

        delete users[accountId];

        localStorage.setItem("users", JSON.stringify(users));
    }

    clearAllData() {

        if (confirm("Clear ALL data?")) {

            localStorage.clear();
        }
    }
}