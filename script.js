// Initialize data from localStorage or create empty arrays
let students = JSON.parse(localStorage.getItem('gymStudents')) || [];
let checkins = JSON.parse(localStorage.getItem('gymCheckins')) || [];

// Set today's date as default for join date
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('join-date').value = today;
    
    // Load all data
    updateDashboard();
    loadStudentsTable();
    loadTodayCheckins();
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
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
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
        phone,
        email,
        joinDate,
        expiryDate: expiryDate.toISOString().split('T')[0],
        feePaid,
        createdAt: new Date().toISOString()
    };
    
    students.push(student);
    saveStudents();
    
    alert('Student added successfully!');
    document.getElementById('add-student-form').reset();
    document.getElementById('join-date').value = new Date().toISOString().split('T')[0];
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
            s.rollNo.toLowerCase().includes(searchTerm)
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
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No students found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredStudents.map(s => {
        const isActive = s.expiryDate >= today;
        return `
            <tr>
                <td><strong>${s.rollNo}</strong></td>
                <td>${s.name}</td>
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
    document.getElementById('edit-phone').value = student.phone;
    document.getElementById('edit-email').value = student.email || '';
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
    students[studentIndex].phone = document.getElementById('edit-phone').value.trim();
    students[studentIndex].email = document.getElementById('edit-email').value.trim();
    
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
window.onclick = function(event) {
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

// Import data function (bonus feature)
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.students && data.checkins) {
                students = data.students;
                checkins = data.checkins;
                saveStudents();
                saveCheckins();
                updateDashboard();
                loadStudentsTable();
                loadTodayCheckins();
                alert('Data imported successfully!');
            }
        } catch (err) {
            alert('Invalid file format');
        }
    };
    reader.readAsText(file);
}
