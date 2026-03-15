class User {

    // Private field to store the password securely
    #password;

    // Constructor to initialize the user object
    constructor(accountId, firstName, lastName, password, role, subjects = []) {
        this.accountId = accountId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.#password = password;
        this.role = role;
        this.subjects = subjects;
        this.createdAt = new Date().toISOString(); // Store creation time for sorting purposes
    }

    // Getter for the full name of the user
    get fullName() {
        return `${this.firstName} ${this.lastName}`; // Return the full name of the user
    }

    // Method to save the user data to local storage
    save() {
        const users = User.getAllFromStorage(); // Retrieve existing users from local storage
        users[this.accountId] = this; // Add or update the user in the users object
        localStorage.setItem("users", JSON.stringify(users)); // Save the user data to local storage
        return true; // Return true to indicate that the save operation was successful
    }

    // Method to delete the user from local storage
    delete() {
        const users = User.getAllFromStorage();
        delete users[this.accountId];
        localStorage.setItem("users", JSON.stringify(users)); // Update local storage after deletion
        return true; // Return true to indicate that the delete operation was successful
    }

    // Static method to retrieve all users from local storage
    static getAllFromStorage() {
        return JSON.parse(localStorage.getItem("users") || "{}");
    }

    // Static method to search for users based on a query
    static search(query) {
        const users = this.getAllFromStorage(); // Retrieve all users from local storage
        query = query.toLowerCase();
        return Object.values(users).filter(u => { // Filter users based on the search query
            const name = `${u.firstName} ${u.lastName}`.toLowerCase(); // Combine first name and last name for searching
            const subjects = (u.subjects || []).join(" ").toLowerCase(); // Combine subjects into a single string for searching
            return ( // Check if the query matches the name, role, or subjects of the user
                name.includes(query) ||
                (u.role || "").toLowerCase().includes(query) || // Check if the query matches any of the subjects
                subjects.includes(query)
            );
        });
    }
}