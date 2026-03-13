$(document).ready(function() {
    // Check role
    if (!checkRole("Administrator")) return;
    
    // Global search
    $("#globalSearch").on("input", function() {
        const query = $(this).val().trim();
        if (query.length < 2) {
            $("#searchResults").empty();
            return;
        }
        performSearch(query, $("#searchResults"));
    });
    
    // Modal handlers
    $("#openTeacherModalBtn, #openStudentModalBtn").click(openAddUserModal);
    $("#quickAddStudent, #quickAddTeacher").click(openQuickAddModal);
    
    // Section button
    $("#addSectionBtnGlobal").click(() => {
        const sectionName = prompt("Enter section name:");
        if (sectionName) {
            DataManager.create("SECTIONS", {
                name: sectionName,
                teacher: getCurrentUser().accountId,
                subject: "General"
            });
            showNotification("Section added!");
            // Refresh sections if table exists
        }
    });
    
    // Clear all data
    $("#clearAllData").click(() => {
        if (confirm("Clear ALL data? This cannot be undone.")) {
            localStorage.clear();
            location.reload();
            showNotification("All data cleared", "warning");
        }
    });
    
    displayUsers();
    updateStats();
    loadGradesPreview();
});

function openAddUserModal() {
    const btnId = event.target.id;
    const role = btnId.includes("Teacher") ? "Teacher" : "Student";
    
    $("#modalTitle").text(`Add ${role}`);
    $("#userRole").val(role);
    $("#userModal").fadeIn();
    $("#userRole").trigger("change");
    
    // Pre-fill role
    $("#accountId, #firstName, #lastName, #password").val("");
    isEditing = false;
    selectedAccountId = null;
}

function openQuickAddModal() {
    openAddUserModal();
}

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
                <td>${user.subjects ? user.subjects.join(", ") : "-"}</td>
                <td>
                    <button class="btn-sm btn-outline editBtn" data-id="${user.accountId}">Edit</button>
                    <button class="btn-sm deleteBtn" data-id="${user.accountId}">Delete</button>
                </td>
            </tr>`;
        
        if (user.role === "Teacher") teacherBody.append(row);
        if (user.role === "Student") studentBody.append(row);
    });
    
    // Event delegation for dynamic buttons
    $(document).off("click", ".editBtn").on("click", ".editBtn", function() {
        editUser($(this).data("id"));
    });
    
    $(document).off("click", ".deleteBtn").on("click", ".deleteBtn", function() {
        deleteUser($(this).data("id"));
    });
}

function updateStats() {
    const users = getAllUsers();
    let studentCount = 0, teacherCount = 0, subjects = new Set();
    
    Object.values(users).forEach(user => {
        if (user.role === "Student") studentCount++;
        if (user.role === "Teacher") teacherCount++;
        if (user.subjects) {
            user.subjects.forEach(subject => subjects.add(subject));
        }
    });
    
    $("#studentCount").text(studentCount);
    $("#teacherCount").text(teacherCount);
    $("#subjectCount").text(subjects.size);
    $("#totalUsers").text(Object.keys(users).length);
}

function editUser(accountId) {
    selectedAccountId = accountId;
    isEditing = true;
    
    const users = getAllUsers();
    const user = users[accountId];
    
    $("#modalTitle").text("Edit User");
    $("#accountId").val(user.accountId).prop("readonly", true);
    $("#firstName").val(user.firstName);
    $("#lastName").val(user.lastName);
    $("#password").val("");
    $("#userRole").val(user.role);
    $("#userRole").trigger("change");
    
    // Check subjects
    if (user.subjects) {
        $(".subject-chk").prop("checked", false);
        user.subjects.forEach(subject => {
            $(`.subject-chk[value="${subject}"]`).prop("checked", true);
        });
    }
    
    $("#userModal").fadeIn();
}

function deleteUser(accountId) {
    if (confirm("Delete this user?")) {
        const users = getAllUsers();
        delete users[accountId];
        saveAllUsers(users);
        showNotification("User deleted", "warning");
        displayUsers();
        updateStats();
    }
}

function updateUser() {
    const accountId = $("#accountId").val().trim();
    const firstName = $("#firstName").val().trim();
    const lastName = $("#lastName").val().trim();
    
    if (!firstName || !lastName) {
        alert("Name fields required");
        return;
    }
    
    const users = getAllUsers();
    const user = users[accountId];
    
    user.firstName = firstName;
    user.lastName = lastName;
    user.fullName = firstName + " " + lastName;
    
    // Update password if provided
    const newPassword = $("#password").val().trim();
    if (newPassword) user.password = newPassword;
    
    // Update subjects
    const subjects = [];
    $(".subject-chk:checked").each(function() {
        subjects.push($(this).val());
    });
    user.subjects = subjects;
    
    saveAllUsers(users);
    $("#userModal").fadeOut();
    displayUsers();
    updateStats();
    showNotification("User updated");
    clearModalInputs();
}

function clearModalInputs() {
    $("#accountId, #firstName, #lastName, #password").val("");
    $("#userRole").val("");
    $(".subject-chk").prop("checked", false);
    $("#subjectsSection").hide();
}

function loadGradesPreview() {
    const users = getAllUsers();
    const tbody = $("#gradesReportTable tbody");
    tbody.empty();

    Object.values(users).filter(u => u.role === "Student").forEach(student => {
        const grades = student.grades || {};
        Object.keys(grades).forEach(subject => {
            const g = grades[subject] || { prelim: null, midterm: null, finals: null };
            const prelim = g.prelim ?? "--";
            const midterm = g.midterm ?? "--";
            const finals = g.finals ?? "--";
            
            const numericGrades = [g.prelim, g.midterm, g.finals].filter(Boolean);
            const finalAvg = numericGrades.length ? 
                (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2) : "--";
            const status = finalAvg === "--" ? "--" : (parseFloat(finalAvg) >= 75 ? "Passed" : "Failed");
            
            tbody.append(`
                <tr>
                    <td>${student.firstName} ${student.lastName}</td>
                    <td>${subject}</td>
                    <td>${prelim}</td>
                    <td>${midterm}</td>
                    <td>${finals}</td>
                    <td>${finalAvg}</td>
                    <td class="status-badge ${status.toLowerCase()}">${status}</td>
                </tr>`);
        });
    });
}

// Export function (ensure it's available)
function exportReport(type, filename) {
    if (type === "studentGrades") {
        let csv = "Student,Subject,Prelim,Midterm,Finals,Final Avg,Status\n";
        const users = getAllUsers();
        Object.values(users).filter(u => u.role === "Student").forEach(student => {
            const grades = student.grades || {};
            Object.keys(grades).forEach(subject => {
                const g = grades[subject] || { prelim: null, midterm: null, finals: null };
                const prelim = g.prelim ?? "--";
                const midterm = g.midterm ?? "--";
                const finals = g.finals ?? "--";
                const numericGrades = [g.prelim, g.midterm, g.finals].filter(Boolean);
                const finalAvg = numericGrades.length ? 
                    (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2) : "--";
                const status = finalAvg === "--" ? "--" : (parseFloat(finalAvg) >= 75 ? "Passed" : "Failed");
                csv += `"${student.firstName} ${student.lastName}",${subject},${prelim},${midterm},${finals},${finalAvg},${status}\n`;
            });
        });
        downloadCSV(csv, filename);
    }
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

