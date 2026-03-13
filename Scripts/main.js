// Central main script for LMS - Auth, Routing, Utils

$(document).ready(function () {
    checkAuth();
    initDummyData();
});

function checkAuth() {
    const currentUser = sessionStorage.getItem("currentUser");

    if (!currentUser && window.location.pathname.includes("admin.html")) {
        window.location.href = "introPage.html";
        return;
    }

    if (currentUser) {
        const user = JSON.parse(currentUser);
        $(".user-name").text(user.fullName || `${user.firstName} ${user.lastName}`);
        $(".welcome-user").text(`Welcome, ${user.role}!`);
    }
}

function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem("currentUser")) || {};
    } catch {
        return {};
    }
}

function checkRole(requiredRole) {
    const user = getCurrentUser();

    if (user.role !== requiredRole) {
        alert(`Access denied. ${requiredRole} role required.`);
        window.location.href = "introPage.html";
        return false;
    }

    return true;
}

function logout() {
    sessionStorage.removeItem("currentUser");
    window.location.href = "introPage.html";
}

function routeTo(page) {
    window.location.href = `pages/${page}.html`;
}

function showNotification(message, type = "success") {

    const colors = {
        success: "#4CAF50",
        error: "#f44336",
        info: "#2196F3",
        warning: "#ff9800"
    };

    const n = $(`<div>${message}</div>`).css({
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "14px 20px",
        background: colors[type],
        color: "white",
        borderRadius: "8px",
        zIndex: 9999
    });

    $("body").append(n);

    setTimeout(() => {
        n.fadeOut(300, function () {
            $(this).remove();
        });
    }, 3000);
}

function initDummyData() {

    if (!localStorage.getItem("users")) {

        const student = new Student(
            "STU001",
            "John",
            "Doe",
            "pass123",
            ["Math", "Science"]
        );

        student.save();

        DataManager.create("SECTIONS", {
            teacherId: "TCH001",
            name: "Grade 11-A",
            subject: "Math"
        });

        DataManager.create("GRADES", {
            studentId: "STU001",
            subject: "Math",
            grade: 85
        });

        showNotification("Dummy data loaded", "info");
    }
}

function exportReport(type, filename = "report.csv") {

    const report = DataManager.generateReport(type);

    if (!report.length) {
        alert("No data available for export");
        return;
    }

    DataManager.exportCSV(report, filename);
    showNotification("Report exported");
}

function performSearch(query, container) {

    const results = User.search(query);

    container.html("");

    results.forEach(user => {
        container.append(`<div>${user.fullName} - ${user.role}</div>`);
    });
}

function validateForm(formData) {

    const errors = [];

    if (!formData.accountId?.trim())
        errors.push("Account ID required");

    if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 100))
        errors.push("Valid age required");

    if (formData.grade && (isNaN(formData.grade) || formData.grade < 0 || formData.grade > 100))
        errors.push("Grade must be 0-100");

    return errors;
}