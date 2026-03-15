let selectedAccountId = null;
let isEditing = false;

$(document).ready(function () {

    if (!checkRole("Administrator")) return;

    displayUsers();
    updateStats();
    loadGradesPreview();
    loadSectionsTable();

    $("#globalSearch").on("input", function () {
        const query = $(this).val().trim();
        if (query.length < 2) {
            $("#searchResults").empty();
            return;
        }
        performSearch(query, $("#searchResults"));
    });

    $("#openTeacherModalBtn, #openStudentModalBtn").click(openAddUserModal);
    $("#quickAddStudent, #quickAddTeacher").click(openAddUserModal);

    $("#addSectionBtnGlobal").click(addSection);

    $("#clearAllData").click(() => {
        if (confirm("Clear ALL data?")) {
            localStorage.clear();
            location.reload();
        }
    });

    // for opening and closing the modal

    $(".closeBtn").click(function () {
        $("#userModal").removeClass("is-open").fadeOut(200);
    });

    $("#userModal").click(function (e) {
        if (e.target.id === "userModal") {
            $("#userModal").removeClass("is-open").fadeOut(200);
        }
    });

});

$(document).keydown(function (e) {
    if (e.key === "Escape") {
        $("#userModal").removeClass("is-open").fadeOut(200);
    }
});


// the section  system
// the admin or teacher can add, edit student's section

function addSection() {

    const sectionName = prompt("Enter section name");

    if (!sectionName) return;

    let sections = JSON.parse(localStorage.getItem("sections") || "[]");

    if (sections.some(s => s.name === sectionName)) {
        alert("Section already exists.");
        return;
    }

    sections.push({
        name: sectionName,
        teacher: "",
        subject: ""
    });

    localStorage.setItem("sections", JSON.stringify(sections));

    loadSectionsTable();
    loadSectionOptions();
}


function loadSectionsTable() {

    const sections = JSON.parse(localStorage.getItem("sections") || "[]");
    const users = getAllUsers();
    const tbody = $("#sectionsTableAdmin tbody");

    tbody.empty();

    sections.forEach((section, index) => {

        const studentCount = Object.values(users)
            .filter(u => u.role === "Student" && u.section === section.name)
            .length;

        tbody.append(`
        <tr>
            <td>${section.name}</td>
            <td>${section.teacher || "-"}</td>
            <td>${section.subject || "-"}</td>
            <td>${studentCount}</td>
            <td>
                <button class="btn-sm deleteSection" data-index="${index}">
                Delete
                </button>
            </td>
        </tr>
        `);

    });

    $(".deleteSection").click(function () {
        deleteSection($(this).data("index"));
    });

}



function deleteSection(index) {

    let sections = JSON.parse(localStorage.getItem("sections") || "[]");

    sections.splice(index, 1);

    localStorage.setItem("sections", JSON.stringify(sections));

    loadSectionsTable();
}



// the dropdown for the section

function loadSectionOptions() {

    const sections = JSON.parse(localStorage.getItem("sections") || "[]");

    const select = $("#sectionInput");

    select.empty();

    select.append(`<option value="">Select Section</option>`);

    sections.forEach(section => {

        select.append(`
        <option value="${section.name}">
        ${section.name}
        </option>
        `);

    });
}



// the modal for the user

function openAddUserModal(event) {

    const btnId = event.target.id;

    const role = btnId.includes("Teacher") ? "Teacher" : "Student";

    $("#modalTitle").text(`Add ${role}`);

    $("#userRole").val(role);

    $("#userModal").addClass("is-open").fadeIn(200);

    $("#userRole").trigger("change");

    $("#accountId").val("");
    $("#firstName").val("");
    $("#lastName").val("");
    $("#password").val("");

    $(".subject-chk").prop("checked", false);

    loadSectionOptions();

}



// displaying the users in a table

function displayUsers() {

    const users = getAllUsers();

    const teacherBody = $("#teacherTable tbody");
    const studentBody = $("#studentTable tbody");

    teacherBody.empty();
    studentBody.empty();

    Object.values(users).forEach(user => {

        let row = `
        <tr>
            <td>${user.accountId}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.section || "-"}</td>
            <td>${user.subjects ? user.subjects.join(", ") : "-"}</td>
            <td>
                <button class="btn-sm editBtn" data-id="${user.accountId}">Edit</button>
                <button class="btn-sm deleteBtn" data-id="${user.accountId}">Delete</button>
            </td>
        </tr>
        `;

        if (user.role === "Teacher") teacherBody.append(row);
        if (user.role === "Student") studentBody.append(row);

    });

    $(".editBtn").click(function () {
        editUser($(this).data("id"));
    });

    $(".deleteBtn").click(function () {
        deleteUser($(this).data("id"));
    });

}


// adding a user i

function addUser() {

    const accountId = $("#accountId").val().trim();
    const firstName = $("#firstName").val().trim();
    const lastName = $("#lastName").val().trim();
    const password = $("#password").val().trim();
    const role = $("#userRole").val();
    const section = $("#sectionInput").val();

    if (!accountId || !firstName || !lastName || !password || !role) {

        alert("Complete all fields");

        return;
    }

    let subjects = [];

    $(".subject-chk:checked").each(function () {

        subjects.push($(this).val());

    });

    let users = getAllUsers();

    if (users[accountId]) {

        alert("Account already exists");

        return;

    }

    users[accountId] = {

        accountId,
        firstName,
        lastName,
        fullName: firstName + " " + lastName,
        password,
        role,
        subjects,
        section,
        createdAt: new Date().toISOString()

    };

    saveAllUsers(users);

    $("#userModal").removeClass("is-open").fadeOut(200);

    displayUsers();

    updateStats();

}


// deleting a user

function deleteUser(accountId) {

    if (!confirm("Delete this user?")) return;

    const users = getAllUsers();

    delete users[accountId];

    saveAllUsers(users);

    displayUsers();

    updateStats();

}


// add user

function editUser(accountId) {
    let users = getAllUsers();
    let user = users[accountId];

    if (!user) return;

    selectedAccountId = accountId;
    isEditing = true;

    $("#accountId").val(user.accountId).prop("disabled", true);
    $("#firstName").val(user.firstName);
    $("#lastName").val(user.lastName);
    $("#password").val("");
    $("#userRole").val(user.role);

    // set section dropdown
    $("#sectionInput").val(user.section || "");

    // set subjects
    $(".subject-chk").prop("checked", false);
    user.subjects?.forEach(sub => {
        $(`.subject-chk[value="${sub}"]`).prop("checked", true);
    });

    $("#userModal").addClass("is-open").fadeIn(200);
}


// the status of student and teacher

function updateStats() {

    const users = getAllUsers();

    let student = 0;
    let teacher = 0;
    let subjects = new Set();

    Object.values(users).forEach(user => {

        if (user.role === "Student") student++;

        if (user.role === "Teacher") teacher++;

        if (user.subjects) {

            user.subjects.forEach(s => subjects.add(s));

        }

    });

    $("#studentCount").text(student);
    $("#teacherCount").text(teacher);
    $("#subjectCount").text(subjects.size);
    $("#totalUsers").text(Object.keys(users).length);

}



// this is for saving the users in a localstorage with JSON

function getAllUsers() {

    return JSON.parse(localStorage.getItem("users") || "{}");

}

function saveAllUsers(users) {

    localStorage.setItem("users", JSON.stringify(users));

}