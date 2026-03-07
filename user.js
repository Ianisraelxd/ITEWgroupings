class User {
    #password;

    constructor(accountId, firstName, lastName, password, role) {
        this.accountId = accountId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.role = role;
        this.createdAt = new Date().toISOString();
    }

    get fullname() {
        return `${this.firstName} ${this.lastName}`;
    }

    getProfle() {
        return {
            id: this.id,
            fullName: this.fullname,
            role: this.role,
            createdAt: this.createdAt,
        };
    }

    save() {
        const users = User.getAllFromStorage();
        localStorage.setItem("users", JSON.stringify(users));
        console.log(`${this.role} "${this.fullName}" saved.`);
    }

    delete() {
        const users = User.getAllFromStorage();
        delete users[this.accountID];
        localStorage.setItem("users", JSON.stringify(users));
        console.log(`${this.role} "${this.fullName}" saved.`);
    }

    static getAllFromStorage() {
        return JSON.parse(localStorage.getItem("users") || "{}");
    }

    toString() {
        return `[${this.role}] ${this.fullname}`;
    }

}