class User {

    #password;

    constructor(accountId, firstName, lastName, password, role, subjects = []) {

        this.accountId = accountId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.#password = password;
        this.role = role;
        this.subjects = subjects;
        this.createdAt = new Date().toISOString();
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    save() {

        const users = User.getAllFromStorage();

        users[this.accountId] = this;

        localStorage.setItem("users", JSON.stringify(users));

        return true;
    }

    delete() {

        const users = User.getAllFromStorage();

        delete users[this.accountId];

        localStorage.setItem("users", JSON.stringify(users));
    }

    static getAllFromStorage() {
        return JSON.parse(localStorage.getItem("users") || "{}");
    }

    static search(query) {

        const users = this.getAllFromStorage();

        query = query.toLowerCase();

        return Object.values(users).filter(u => {

            const name = `${u.firstName} ${u.lastName}`.toLowerCase();

            const subjects = (u.subjects || []).join(" ").toLowerCase();

            return (
                name.includes(query) ||
                (u.role || "").toLowerCase().includes(query) ||
                subjects.includes(query)
            );
        });
    }
}