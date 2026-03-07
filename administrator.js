class Administrator extends User{
    constructor(accountId, firstName, lastName) {
        super(accountId, firstName, lastName);
        this.managedTeachers = [];
        this.managedStudents = [];
    }

    addTeacher(teacher) {
        if(!(teacher instanceof Teacher)) {
            throw new Error("Only a Teacher can be added.");
        }
        teacher.save();
        this.managedTeachers.push(teacher.accountId);
        console.log(`Sucessfully added a teacher: " ${teacher.fullName}`);
    }

    removeTeacher(teacher) {
        if(!(teacher instanceof Teacher)) {
            throw new Error("Only a Teacher can be added.");
        }
        teacher.delete();
        this.managedTeachers = this.managedTeachers.filter(accountId => accountId !== teacher.accountId);
        console.log(`Teacher is successfully removed: ${teacher.fullName}`);
    }

    addStudent(student) {
        if(!(student instanceof Student)) {
            throw new Error("Only a Teacher can be added.");
        }
        student.save();
        this.managedStudents.push(student.accountId);
        console.log(`Sucessfully added a student: " ${student.fullName}`);
    }

    removeStudent(student) {
        if(!(student instanceof Student)) {
            throw new Error("Only a Teacher can be added.");
        }
        student.delete();
        this.managedStudent = this.managedStudent.filter(accountId => accountId !== student.accountId);
        console.log(`Student is successfully removed: ${student.fullName}`);
    }

    clearAllData() {
        localStorage.clear();
        console.log("All application data is cleared by the Administrator");
    }

    getProfile() {
        return {
            ...super.getProfle(),
            managedTeachers: this.managedTeachers,
            managedStudents: this.managedStudents,
        };
    }
}