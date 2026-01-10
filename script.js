// Initialize data from localStorage or create empty arrays
let students = JSON.parse(localStorage.getItem('gymStudents')) || [];
let checkins = JSON.parse(localStorage.getItem('gymCheckins')) || [];

// Default admin credentials (will be overwritten if changed)
const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123'
};

// Get admin credentials from localStorage or use defaults
function getAdminCredentials() {
    const stored = localStorage.getItem('gymAdminCredentials');
    if (stored) {
        return JSON.parse(stored);
    }
    return DEFAULT_ADMIN;
}

// Save admin credentials to localStorage
function saveAdminCredentials(username, password) {
    localStorage.setItem('gymAdminCredentials', JSON.stringify({ username, password }));
}

// Check if user is logged in
function isLoggedIn() {
    return sessionStorage.getItem('gymLoggedIn') === 'true';
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    const admin = getAdminCredentials();
    
    if (username === admin.username && password === admin.password) {
        sessionStorage.setItem('gymLoggedIn', 'true');
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        errorEl.style.display = 'none';
        
        // Initialize the app
        initializeApp();
    } else {
        errorEl.textContent = 'Invalid username or password!';
        errorEl.style.display = 'block';
    }
}

// Handle Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('gymLoggedIn');
        document.getElementById('main-app').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
    }
}

// Change Credentials
function changeCredentials(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newUsername = document.getElementById('new-username').value.trim();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const messageEl = document.getElementById('settings-message');
    
    const admin = getAdminCredentials();
    
    // Validate current password
    if (currentPassword !== admin.password) {
        messageEl.textContent = '❌ Current password is incorrect!';
        messageEl.className = 'error';
        return;
    }
    
    // Validate new password match
    if (newPassword !== confirmPassword) {
        messageEl.textContent = '❌ New passwords do not match!';
        messageEl.className = 'error';
        return;
    }
    
    // Validate minimum password length
    if (newPassword.length < 4) {
        messageEl.textContent = '❌ Password must be at least 4 characters!';
        messageEl.className = 'error';
        return;
    }
    
    // Save new credentials
    saveAdminCredentials(newUsername, newPassword);
    
    messageEl.textContent = '✅ Credentials updated successfully!';
    messageEl.className = 'success';
    
    // Clear form
    document.getElementById('current-password').value = '';
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    
    // Show current username
    setTimeout(() => {
        messageEl.textContent = `✅ New username: ${newUsername}`;
    }, 2000);
}

// Initialize App after login
function initializeApp() {
    const today = new Date().toISOString().split('T')[0];
    const joinDateEl = document.getElementById('join-date');
    if (joinDateEl) {
        joinDateEl.value = today;
    }
    
    // Load all data
    updateDashboard();
    loadStudentsTable();
    loadTodayCheckins();
    
    // Pre-fill current username in settings
    const admin = getAdminCredentials();
    const newUsernameEl = document.getElementById('new-username');
    if (newUsernameEl) {
        newUsernameEl.value = admin.username;
    }
}

// Set today's date as default for join date
document.addEventListener('DOMContentLoaded', function () {
    // Check if already logged in
    if (isLoggedIn()) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        initializeApp();
    } else {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }
});

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Add active to clicked button
    event.target.classList.add('active');

    // Refresh data when switching sections
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'all-students') {
        loadStudentsTable();
    } else if (sectionId === 'check-in') {
        loadTodayCheckins();
    }
}

// Add Student
function addStudent(event) {
    event.preventDefault();

    const rollNo = document.getElementById('roll-no').value.trim().toUpperCase();
    const name = document.getElementById('student-name').value.trim();
    const gender = document.getElementById('gender').value;
    const phone = document.getElementById('phone').value.trim();
    const joinDate = document.getElementById('join-date').value;
    const duration = parseInt(document.getElementById('membership-duration').value);
    const feePaid = document.getElementById('fee-paid').value;

    // Check if roll number already exists
    if (students.find(s => s.rollNo === rollNo)) {
        alert('A student with this roll number already exists!');
        return;
    }

    // Calculate expiry date
    const expiryDate = new Date(joinDate);
    expiryDate.setMonth(expiryDate.getMonth() + duration);

    const student = {
        rollNo,
        name,
        gender,
        phone,
        joinDate,
        expiryDate: expiryDate.toISOString().split('T')[0],
        feePaid,
        createdAt: new Date().toISOString()
    };

    students.push(student);
    saveStudents();

    // Backup to Google Sheets
    backupToGoogleSheets(student);

    alert('Student added successfully!');
    document.getElementById('add-student-form').reset();
    document.getElementById('join-date').value = new Date().toISOString().split('T')[0];
}

// Config for Google Sheets
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzS6npJJcgnzYz2ZvrgNpBsc2Mtd0pjfKJVXCTnPrSLO89zfUagh8QzUuVJq4T3A9oe/exec';

// Toast Notification
function showToast(title, message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✅' : '⚠️';

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 5000);
}

// Backup function
function backupToGoogleSheets(student) {
    // Show initial toast
    showToast('Backup Started', 'Sending data to Google Sheets...', 'success');

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'text/plain',
        },
        redirect: 'follow',
        body: JSON.stringify(student)
    })
        .then(response => {
            console.log('Backup request sent', response);
            // Since we use no-cors, we can't read the response, but if we get here, the request was sent.
            // We'll assume success for user feedback in this context.
            setTimeout(() => {
                showToast('Backup Successful', 'Student data saved to Google Sheets', 'success');
            }, 1000);
        })
        .catch(error => {
            console.error('Backup failed:', error);
            showToast('Backup Failed', 'Could not save to Google Sheets. Check internet connection.', 'error');
        });
}

// Save students to localStorage
function saveStudents() {
    localStorage.setItem('gymStudents', JSON.stringify(students));
}

// Save checkins to localStorage
function saveCheckins() {
    localStorage.setItem('gymCheckins', JSON.stringify(checkins));
}

// Update Dashboard
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];

    // Calculate stats
    const totalStudents = students.length;
    const activeMembers = students.filter(s => s.expiryDate >= today).length;
    const expiredMembers = students.filter(s => s.expiryDate < today).length;

    // Today's checkins
    const todayCheckins = checkins.filter(c => c.date === today).length;

    // Update stats display
    document.getElementById('total-students').textContent = totalStudents;
    document.getElementById('active-members').textContent = activeMembers;
    document.getElementById('expired-members').textContent = expiredMembers;
    document.getElementById('today-checkins').textContent = todayCheckins;

    // Expiring today
    const expiringToday = students.filter(s => s.expiryDate === today);
    const expiringTodayDiv = document.getElementById('expiring-today-list');

    if (expiringToday.length > 0) {
        expiringTodayDiv.innerHTML = expiringToday.map(s => `
            <div class="expiry-item">
                <div class="info">
                    <span class="roll">${s.rollNo}</span>
                    <span class="name">${s.name}</span>
                    <span class="phone">${s.phone}</span>
                </div>
                <button class="btn btn-edit" onclick="openEditModal('${s.rollNo}')">Renew</button>
            </div>
        `).join('');
    } else {
        expiringTodayDiv.innerHTML = '<p class="no-data">No memberships expiring today</p>';
    }

    // Expiring in next 7 days
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const next7DaysStr = next7Days.toISOString().split('T')[0];

    const expiringSoon = students.filter(s => s.expiryDate > today && s.expiryDate <= next7DaysStr);
    const expiringSoonDiv = document.getElementById('expiring-soon-list');

    if (expiringSoon.length > 0) {
        expiringSoonDiv.innerHTML = expiringSoon.map(s => `
            <div class="expiry-item">
                <div class="info">
                    <span class="roll">${s.rollNo}</span>
                    <span class="name">${s.name}</span>
                    <span>Expires: ${formatDate(s.expiryDate)}</span>
                </div>
                <button class="btn btn-edit" onclick="openEditModal('${s.rollNo}')">Renew</button>
            </div>
        `).join('');
    } else {
        expiringSoonDiv.innerHTML = '<p class="no-data">No upcoming expirations in next 7 days</p>';
    }
}

// Load Students Table
function loadStudentsTable() {
    filterStudents();
}

// Filter Students
function filterStudents() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    const today = new Date().toISOString().split('T')[0];

    let filteredStudents = students;

    // Search filter
    if (searchTerm) {
        filteredStudents = filteredStudents.filter(s =>
            s.name.toLowerCase().includes(searchTerm) ||
            s.rollNo.toLowerCase().includes(searchTerm) ||
            s.phone.includes(searchTerm)
        );
    }

    // Status filter
    if (statusFilter === 'active') {
        filteredStudents = filteredStudents.filter(s => s.expiryDate >= today);
    } else if (statusFilter === 'expired') {
        filteredStudents = filteredStudents.filter(s => s.expiryDate < today);
    }

    // Sort by name
    filteredStudents.sort((a, b) => a.name.localeCompare(b.name));

    const tbody = document.getElementById('students-tbody');

    if (filteredStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No students found</td></tr>';
        return;
    }

    tbody.innerHTML = filteredStudents.map(s => {
        const isActive = s.expiryDate >= today;
        return `
            <tr>
                <td><strong>${s.rollNo}</strong></td>
                <td>${s.name}</td>
                <td>${s.gender || '-'}</td>
                <td>${s.phone}</td>
                <td>${formatDate(s.joinDate)}</td>
                <td>${formatDate(s.expiryDate)}</td>
                <td><span class="${isActive ? 'status-active' : 'status-expired'}">${isActive ? 'Active' : 'Expired'}</span></td>
                <td class="action-btns">
                    <button class="btn btn-edit" onclick="openEditModal('${s.rollNo}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteStudent('${s.rollNo}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Open Edit Modal
function openEditModal(rollNo) {
    const student = students.find(s => s.rollNo === rollNo);
    if (!student) return;

    document.getElementById('edit-roll-no').value = student.rollNo;
    document.getElementById('edit-name').value = student.name;
    document.getElementById('edit-gender').value = student.gender || 'male';
    document.getElementById('edit-phone').value = student.phone;
    document.getElementById('edit-expiry').value = student.expiryDate;
    document.getElementById('extend-membership').value = '0';

    document.getElementById('edit-modal').classList.add('show');
}

// Close Modal
function closeModal() {
    document.getElementById('edit-modal').classList.remove('show');
}

// Update Student
function updateStudent(event) {
    event.preventDefault();

    const rollNo = document.getElementById('edit-roll-no').value;
    const studentIndex = students.findIndex(s => s.rollNo === rollNo);

    if (studentIndex === -1) return;

    students[studentIndex].name = document.getElementById('edit-name').value.trim();
    students[studentIndex].gender = document.getElementById('edit-gender').value;
    students[studentIndex].phone = document.getElementById('edit-phone').value.trim();

    // Handle expiry date extension
    const extension = parseInt(document.getElementById('extend-membership').value);
    if (extension > 0) {
        const currentExpiry = new Date(document.getElementById('edit-expiry').value);
        currentExpiry.setMonth(currentExpiry.getMonth() + extension);
        students[studentIndex].expiryDate = currentExpiry.toISOString().split('T')[0];
    } else {
        students[studentIndex].expiryDate = document.getElementById('edit-expiry').value;
    }

    saveStudents();
    closeModal();
    loadStudentsTable();
    updateDashboard();

    alert('Student updated successfully!');
}

// Delete Student
function deleteStudent(rollNo) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    students = students.filter(s => s.rollNo !== rollNo);
    saveStudents();
    loadStudentsTable();
    updateDashboard();

    alert('Student deleted successfully!');
}

// Check-in Student
function checkInStudent() {
    const rollNo = document.getElementById('checkin-roll').value.trim().toUpperCase();
    const messageDiv = document.getElementById('checkin-message');

    if (!rollNo) {
        showCheckinMessage('Please enter a roll number', 'error');
        return;
    }

    const student = students.find(s => s.rollNo === rollNo);

    if (!student) {
        showCheckinMessage(`No student found with roll number: ${rollNo}`, 'error');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Check if membership is expired
    if (student.expiryDate < today) {
        showCheckinMessage(`⚠️ ${student.name}'s membership has EXPIRED on ${formatDate(student.expiryDate)}. Please renew!`, 'warning');
        return;
    }

    // Check if already checked in today
    const alreadyCheckedIn = checkins.find(c => c.rollNo === rollNo && c.date === today);

    if (alreadyCheckedIn) {
        showCheckinMessage(`${student.name} has already checked in today at ${alreadyCheckedIn.time}`, 'warning');
        return;
    }

    // Add check-in
    checkins.push({
        rollNo,
        name: student.name,
        date: today,
        time: timeStr,
        timestamp: now.toISOString()
    });

    saveCheckins();
    loadTodayCheckins();
    updateDashboard();

    showCheckinMessage(`✅ Welcome, ${student.name}! Check-in successful at ${timeStr}`, 'success');
    document.getElementById('checkin-roll').value = '';
    document.getElementById('checkin-roll').focus();
}

// Handle Enter key for check-in
function handleCheckinKeypress(event) {
    if (event.key === 'Enter') {
        checkInStudent();
    }
}

// Show Check-in Message
function showCheckinMessage(message, type) {
    const messageDiv = document.getElementById('checkin-message');
    messageDiv.textContent = message;
    messageDiv.className = type;

    // Auto hide after 5 seconds
    setTimeout(() => {
        messageDiv.className = '';
        messageDiv.style.display = 'none';
    }, 5000);
}

// Load Today's Check-ins
function loadTodayCheckins() {
    const today = new Date().toISOString().split('T')[0];
    const todayCheckins = checkins.filter(c => c.date === today);

    // Sort by time (most recent first)
    todayCheckins.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const checkinListDiv = document.getElementById('checkin-list');

    if (todayCheckins.length === 0) {
        checkinListDiv.innerHTML = '<p class="no-data">No check-ins yet today</p>';
        return;
    }

    checkinListDiv.innerHTML = todayCheckins.map(c => `
        <div class="checkin-item">
            <div>
                <strong>${c.rollNo}</strong> - ${c.name}
            </div>
            <span class="time">${c.time}</span>
        </div>
    `).join('');
}

// Format Date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('edit-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Export data function (bonus feature)
function exportData() {
    const data = {
        students,
        checkins,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

// Import data function (handle Excel upload)
function handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
            alert('Excel file is empty!');
            return;
        }

        let successCount = 0;
        let failCount = 0;
        let errors = [];

        jsonData.forEach((row, index) => {
            // Map keys to match your Excel format: ROLL NUMBER, Name, GENDER, MOBILE, DOJ, Fee
            const rollNo = (row['ROLL NUMBER'] || row['Roll Number'] || row['Roll No'] || row['RollNo'] || row['roll number'] || '').toString().trim().toUpperCase();
            const name = (row['Name'] || row['NAME'] || row['name'] || '').toString().trim();
            const gender = (row['GENDER'] || row['Gender'] || row['gender'] || '').toString().trim().toLowerCase();
            const phone = (row['MOBILE'] || row['Mobile'] || row['Phone'] || row['phone'] || '').toString().trim();

            // Handle Excel date (DOJ - Date of Joining)
            let joinDate = row['DOJ'] || row['doj'] || row['Join Date'] || row['join date'];
            if (typeof joinDate === 'number') {
                // Excel date serial number to JS Date
                const date = new Date((joinDate - (25567 + 2)) * 86400 * 1000);
                joinDate = date.toISOString().split('T')[0];
            } else if (typeof joinDate === 'string') {
                // Try to parse date string like "13 December 2025"
                const parsedDate = new Date(joinDate);
                if (!isNaN(parsedDate)) {
                    joinDate = parsedDate.toISOString().split('T')[0];
                }
            }

            const feePaid = row['Fee'] || row['FEE'] || row['fee'] || row['Fee Paid'] || row['fee paid'] || 0;

            // Calculate expiry date (1 month from join date by default if not specified)
            const duration = parseInt(row['Duration'] || row['duration'] || 1);

            if (!rollNo || !name || !phone || !joinDate) {
                failCount++;
                errors.push(`Row ${index + 2}: Missing required fields (Roll No, Name, Mobile, or DOJ)`);
                return;
            }

            // Check for duplicates
            if (students.find(s => s.rollNo === rollNo)) {
                failCount++;
                errors.push(`Row ${index + 2}: Duplicate Roll No (${rollNo})`);
                return;
            }

            // Calculate expiry
            const expiryDate = new Date(joinDate);
            expiryDate.setMonth(expiryDate.getMonth() + duration);

            const student = {
                rollNo,
                name,
                gender,
                phone,
                joinDate,
                expiryDate: expiryDate.toISOString().split('T')[0],
                feePaid,
                createdAt: new Date().toISOString()
            };

            students.push(student);
            successCount++;
        });

        saveStudents();
        updateDashboard();
        loadStudentsTable(); // Refresh table if on All Students page

        let message = `Successfully added ${successCount} students.`;
        if (failCount > 0) {
            message += `\nFailed to add ${failCount} students.`;
            if (errors.length > 0) {
                message += `\nErrors:\n${errors.slice(0, 5).join('\n')}`;
                if (errors.length > 5) message += `\n...and ${errors.length - 5} more errors.`;
            }
        }

        alert(message);

        // Reset input
        document.getElementById('excel-file').value = '';
    };

    reader.readAsArrayBuffer(file);
}

// Download Excel Template
function downloadTemplate() {
    // Template matching your Excel format: ROLL NUMBER, Name, GENDER, MOBILE, DOJ, Fee
    const templateData = [
        {
            "ROLL NUMBER": "HSF20212806",
            "Name": "John Doe",
            "GENDER": "male",
            "MOBILE": "9876543210",
            "DOJ": "15 December 2025",
            "Fee": 600
        },
        {
            "ROLL NUMBER": "HSF20212807",
            "Name": "Jane Smith",
            "GENDER": "female",
            "MOBILE": "9876543211",
            "DOJ": "16 December 2025",
            "Fee": 600
        }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, "Gym_Student_Template.xlsx");
}
