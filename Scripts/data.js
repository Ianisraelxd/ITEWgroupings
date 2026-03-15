// this is a data manager weve made so our website have CRUD capability  and an ability to save it in a local storage
class DataManager {

    static STORAGE_KEYS = {
        USERS: "users",
        SECTIONS: "sections",
        GRADES: "grades",
        ATTENDANCE: "attendance"
    };

    // getting all key from the local Storage
    static getAll(key) {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS[key]) || "[]");
    }

    // saving it
    static save(key, data) {
        localStorage.setItem(this.STORAGE_KEYS[key], JSON.stringify(data));
    }

    // creating an item
    static create(key, item) {

        const data = this.getAll(key);

        item.id = Date.now();
        item.createdAt = new Date().toISOString();

        data.push(item);

        this.save(key, data);

        return item;
    }

    // for updting the data
    static update(key, id, updates) {

        const data = this.getAll(key);

        const index = data.findIndex(i => i.id == id);

        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            this.save(key, data);
        }
    }

    static delete(key, id) {

        const data = this.getAll(key).filter(i => i.id != id);
        this.save(key, data);
    }

    static search(key, query) {

        const data = this.getAll(key);

        return data.filter(item =>
            JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
        );
    }

    // this is for generating a report so we can save it into a CSV file
    static generateReport(type) {

        switch (type) {

            case "studentGrades":

                const grades = this.getAll("GRADES");
                const users = JSON.parse(localStorage.getItem("users") || "{}");

                return grades.map(g => {

                    const student = users[g.studentId];

                    return {
                        student: student ? `${student.firstName} ${student.lastName}` : "Unknown",
                        subject: g.subject,
                        grade: g.grade
                    };
                });

            case "attendance":
                return this.getAll("ATTENDANCE");

            default:
                return [];
        }
    }

    // in order to save it in CSV
    static exportCSV(data, filename) {

        if (!data.length) return;

        const headers = Object.keys(data[0]);

        const csv = [
            headers.join(","),
            ...data.map(row =>
                headers.map(field => `"${row[field] ?? ""}"`).join(",")
            )
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = filename;

        a.click();
    }
}