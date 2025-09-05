// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARHe9eh62zpRSqePc_eoHAysUR4vHzyp4",
  authDomain: "schol-fccf0.firebaseapp.com",
  projectId: "schol-fccf0",
  storageBucket: "schol-fccf0.firebasestorage.app",
  messagingSenderId: "988694010538",
  appId: "1:988694010538:web:6d24e9e064cf463dc4ced3",
  measurementId: "G-9XQ91QMZ9H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// متغيرات عامة
let currentUser = null;
let currentSection = 'home';
let currentFilter = 'all';

// البيانات الافتراضية
const defaultData = {
    users: [
        {
            id: 1,
            username: 'abdullah_admin',
            email: 'abdullah@alarida.edu.sa',
            password: 'admin123',
            role: 'admin',
            isActive: true,
            createdAt: '2025-01-01'
        },
        {
            id: 2,
            username: 'saddam_hazazi',
            email: 'saddam@alarida.edu.sa',
            password: 'director123',
            role: 'moderator',
            isActive: true,
            createdAt: '2025-01-01'
        },
        {
            id: 3,
            username: 'mohammed_hazazi',
            email: 'mohammed@alarida.edu.sa',
            password: 'teacher123',
            role: 'moderator',
            isActive: true,
            createdAt: '2025-01-01'
        }
    ],
    announcements: [],
    achievements: [],
    resources: [],
    studyPlans: [],
    messages: []
};

// تكامل Firebase
// قم بإضافة إعدادات Firebase الخاصة بك هنا


// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// تحميل البيانات عند بدء التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    checkAuthStatus();
    loadAllContent();
    setupEventListeners();
});

// تهيئة البيانات
function initializeData() {
    // تحقق من وجود البيانات في localStorage
    Object.keys(defaultData).forEach(key => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(defaultData[key]));
        }
    });
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // نموذج تسجيل الدخول
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // نموذج التسجيل
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // نموذج التواصل
    document.getElementById('contact-form').addEventListener('submit', handleContactForm);
    
    // نموذج المحتوى
    document.getElementById('content-form').addEventListener('submit', handleContentForm);
    
    // إغلاق النوافذ المنبثقة عند النقر خارجها
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// التحقق من حالة المصادقة
function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

// تحديث واجهة المصادقة
function updateAuthUI() {
    const authContainer = document.getElementById('nav-auth');
    
    if (currentUser) {
        authContainer.innerHTML = `
            <div class="user-info">
                <span>مرحباً، ${currentUser.username}</span>
                ${canManageContent() ? '<button class="btn-admin" onclick="showSection(\'admin\')">لوحة التحكم</button>' : ''}
                <button class="btn-logout" onclick="logout()">تسجيل الخروج</button>
            </div>
        `;
        
        // إظهار أزرار الإضافة للمشرفين والمدراء
        if (canManageContent()) {
            document.getElementById('add-announcement-btn').style.display = 'block';
            document.getElementById('add-achievement-btn').style.display = 'block';
            document.getElementById('add-resource-btn').style.display = 'block';
            document.getElementById('add-plan-btn').style.display = 'block';
        }
    } else {
        authContainer.innerHTML = `
            <button class="btn-login" onclick="showLogin()">تسجيل الدخول</button>
            <button class="btn-register" onclick="showRegister()">التسجيل</button>
        `;
    }
}

// عرض قسم معين
function showSection(sectionName) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // إزالة الفئة النشطة من جميع الروابط
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // عرض القسم المطلوب
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.classList.add('fade-in');
    }
    
    // تفعيل الرابط المناسب إذا لم يكن لوحة التحكم
    if (sectionName !== 'admin') {
        const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    currentSection = sectionName;
    
    // تحميل المحتوى للقسم
    loadSectionContent(sectionName);
}

// تحميل محتوى القسم
function loadSectionContent(sectionName) {
    switch(sectionName) {
        case 'announcements':
            loadAnnouncements();
            break;
        case 'achievements':
            loadAchievements();
            break;
        case 'resources':
            loadResources();
            break;
        case 'study-plans':
            loadStudyPlans();
            break;
        case 'admin':
            loadAdminContent();
            break;
    }
}

// تحميل جميع المحتوى
function loadAllContent() {
    loadAnnouncements();
    loadAchievements();
    loadResources();
    loadStudyPlans();
}

// جلب البيانات من Firebase
function getData(type) {
    return new Promise((resolve) => {
        database.ref(type).once('value', (snapshot) => {
            resolve(snapshot.val() || []);
        });
    });
}

// حفظ البيانات في Firebase
function saveData(type, data) {
    database.ref(type).set(data);
}

// تحميل الإعلانات (تحديث لحظي)
function loadAnnouncements() {
    const grid = document.getElementById('announcements-grid');

    database.ref('announcements').on('value', (snapshot) => {
        const announcements = snapshot.val() || [];

        if (announcements.length === 0) {
            grid.innerHTML = '<p>لا توجد إعلانات حالياً.</p>';
            return;
        }

        grid.innerHTML = announcements.map(announcement => `
            <div class="card fade-in">
                <h3>${announcement.title}</h3>
                <p>${announcement.content}</p>
                ${announcement.imageUrl ? `<img src="${announcement.imageUrl}" alt="${announcement.title}" style="width: 100%; border-radius: 10px; margin: 1rem 0;">` : ''}
                <div class="card-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(announcement.createdAt)}</span>
                    <span><i class="fas fa-user"></i> ${announcement.createdBy}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-small btn-edit" onclick="editContent('announcement', ${announcement.id})">تعديل</button>
                    <button class="btn-small btn-delete" onclick="deleteContent('announcements', ${announcement.id})">حذف</button>
                </div>
            </div>
        `).join('');
    });
}

// تحميل الإنجازات
function loadAchievements() {
    const achievements = getData('achievements').filter(a => a.isActive);
    const grid = document.getElementById('achievements-grid');
    
    if (achievements.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-trophy"></i><p>لا توجد إنجازات حالياً</p></div>';
        return;
    }
    
    grid.innerHTML = achievements.map(achievement => `
        <div class="card fade-in">
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
            ${achievement.imageUrl ? `<img src="${achievement.imageUrl}" alt="${achievement.title}" style="width: 100%; border-radius: 10px; margin: 1rem 0;">` : ''}
            <div class="card-meta">
                <span><i class="fas fa-user"></i> ${achievement.studentName}</span>
                <span><i class="fas fa-calendar"></i> ${formatDate(achievement.achievementDate)}</span>
            </div>
            ${canManageContent() ? `
                <div class="card-actions">
                    <button class="btn-small btn-edit" onclick="editContent('achievement', ${achievement.id})">تعديل</button>
                    <button class="btn-small btn-delete" onclick="deleteContent('achievements', ${achievement.id})">حذف</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// تحميل المصادر
function loadResources(filter = 'all') {
    let resources = getData('resources').filter(r => r.isActive);
    
    if (filter !== 'all') {
        resources = resources.filter(resource => resource.resourceType === filter);
    }
    
    const grid = document.getElementById('resources-grid');
    
    if (resources.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><p>لا توجد مصادر حالياً</p></div>';
        return;
    }
    
    grid.innerHTML = resources.map(resource => `
        <div class="card fade-in">
            <h3>${resource.title}</h3>
            <p>${resource.description}</p>
            <div class="card-meta">
                <span><i class="fas fa-tag"></i> ${resource.category}</span>
                <span><i class="fas fa-file"></i> ${getResourceTypeLabel(resource.resourceType)}</span>
            </div>
            <div style="margin-top: 1rem;">
                ${resource.fileUrl ? `<a href="${resource.fileUrl}" target="_blank" class="btn-primary" style="display: inline-block; padding: 0.5rem 1rem; text-decoration: none; border-radius: 5px; margin-left: 0.5rem;">تحميل الملف</a>` : ''}
                ${resource.externalUrl ? `<a href="${resource.externalUrl}" target="_blank" class="btn-secondary" style="display: inline-block; padding: 0.5rem 1rem; text-decoration: none; border-radius: 5px;">زيارة الرابط</a>` : ''}
            </div>
            ${canManageContent() ? `
                <div class="card-actions">
                    <button class="btn-small btn-edit" onclick="editContent('resource', ${resource.id})">تعديل</button>
                    <button class="btn-small btn-delete" onclick="deleteContent('resources', ${resource.id})">حذف</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// تحميل خطط المذاكرة
function loadStudyPlans() {
    const studyPlans = getData('studyPlans').filter(p => p.isActive);
    const grid = document.getElementById('study-plans-grid');
    
    if (studyPlans.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>لا توجد خطط مذاكرة حالياً</p></div>';
        return;
    }
    
    grid.innerHTML = studyPlans.map(plan => `
        <div class="card fade-in">
            <h3>${plan.title}</h3>
            <p>${plan.description}</p>
            <div class="card-meta">
                <span><i class="fas fa-clock"></i> ${plan.durationWeeks} أسابيع</span>
                <span><i class="fas fa-signal"></i> ${plan.difficultyLevel}</span>
                <span><i class="fas fa-tag"></i> ${plan.planType}</span>
            </div>
            <div style="margin-top: 1rem;">
                <button class="btn-primary" onclick="viewStudyPlan(${plan.id})">عرض الخطة</button>
            </div>
            ${canManageContent() ? `
                <div class="card-actions">
                    <button class="btn-small btn-edit" onclick="editContent('study-plan', ${plan.id})">تعديل</button>
                    <button class="btn-small btn-delete" onclick="deleteContent('studyPlans', ${plan.id})">حذف</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// تسجيل الدخول
function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    const users = getData('users');
    const user = users.find(u => u.username === username && u.password === password && u.isActive);
    
    if (user) {
        currentUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        closeModal('login-modal');
        showNotification('تم تسجيل الدخول بنجاح', 'success');
        e.target.reset();
    } else {
        showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    }
}

// التسجيل
function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    
    if (password !== confirmPassword) {
        showNotification('كلمة المرور وتأكيد كلمة المرور غير متطابقتان', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    const users = getData('users');
    
    if (users.find(u => u.username === username)) {
        showNotification('اسم المستخدم موجود بالفعل', 'error');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        showNotification('البريد الإلكتروني موجود بالفعل', 'error');
        return;
    }
    
    const newUser = {
        id: users.length + 1,
        username,
        email,
        password,
        role: 'user',
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    saveData('users', users);
    
    currentUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    closeModal('register-modal');
    showNotification('تم إنشاء الحساب بنجاح', 'success');
    e.target.reset();
}

// تسجيل الخروج
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showNotification('تم تسجيل الخروج بنجاح', 'success');
    
    // إخفاء أزرار الإضافة
    document.getElementById('add-announcement-btn').style.display = 'none';
    document.getElementById('add-achievement-btn').style.display = 'none';
    document.getElementById('add-resource-btn').style.display = 'none';
    document.getElementById('add-plan-btn').style.display = 'none';
    
    // العودة للصفحة الرئيسية
    showSection('home');
}

// معالجة نموذج التواصل
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const message = {
        id: Date.now(),
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        createdAt: new Date().toISOString().split('T')[0],
        isRead: false
    };
    
    const messages = getData('messages');
    messages.push(message);
    saveData('messages', messages);
    
    e.target.reset();
    showNotification('تم إرسال الرسالة بنجاح', 'success');
}

// عرض/إخفاء النوافذ المنبثقة
function showLogin() {
    document.getElementById('login-modal').style.display = 'block';
}

function showRegister() {
    document.getElementById('register-modal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// إظهار نموذج الإضافة
function showAddForm(type) {
    if (!canManageContent()) {
        showNotification('ليس لديك صلاحية لإضافة محتوى', 'error');
        return;
    }
    
    const modal = document.getElementById('content-modal');
    const title = document.getElementById('content-modal-title');
    const form = document.getElementById('content-form');
    const fieldsContainer = document.getElementById('content-form-fields');
    
    form.dataset.type = type;
    form.dataset.action = 'add';
    
    switch(type) {
        case 'announcement':
            title.textContent = 'إضافة إعلان جديد';
            fieldsContainer.innerHTML = `
                <div class="form-group">
                    <label for="title">العنوان</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="content">المحتوى</label>
                    <textarea id="content" name="content" rows="5" required></textarea>
                </div>
                <div class="form-group">
                    <label for="imageUrl">رابط الصورة (اختياري)</label>
                    <input type="url" id="imageUrl" name="imageUrl">
                </div>
            `;
            break;
            
        case 'achievement':
            title.textContent = 'إضافة إنجاز جديد';
            fieldsContainer.innerHTML = `
                <div class="form-group">
                    <label for="title">عنوان الإنجاز</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="description">وصف الإنجاز</label>
                    <textarea id="description" name="description" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="studentName">اسم الطالب</label>
                    <input type="text" id="studentName" name="studentName" required>
                </div>
                <div class="form-group">
                    <label for="achievementDate">تاريخ الإنجاز</label>
                    <input type="date" id="achievementDate" name="achievementDate" required>
                </div>
                <div class="form-group">
                    <label for="imageUrl">رابط الصورة (اختياري)</label>
                    <input type="url" id="imageUrl" name="imageUrl">
                </div>
            `;
            break;
            
        case 'resource':
            title.textContent = 'إضافة مصدر جديد';
            fieldsContainer.innerHTML = `
                <div class="form-group">
                    <label for="title">عنوان المصدر</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="description">وصف المصدر</label>
                    <textarea id="description" name="description" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="category">التصنيف</label>
                    <input type="text" id="category" name="category" required>
                </div>
                <div class="form-group">
                    <label for="resourceType">نوع المصدر</label>
                    <select id="resourceType" name="resourceType" required>
                        <option value="pdf">ملف PDF</option>
                        <option value="video">فيديو</option>
                        <option value="link">رابط خارجي</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="fileUrl">رابط الملف</label>
                    <input type="url" id="fileUrl" name="fileUrl">
                </div>
                <div class="form-group">
                    <label for="externalUrl">الرابط الخارجي</label>
                    <input type="url" id="externalUrl" name="externalUrl">
                </div>
            `;
            break;
            
        case 'study-plan':
            title.textContent = 'إضافة خطة مذاكرة جديدة';
            fieldsContainer.innerHTML = `
                <div class="form-group">
                    <label for="title">عنوان الخطة</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="description">وصف الخطة</label>
                    <textarea id="description" name="description" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="planType">نوع الخطة</label>
                    <select id="planType" name="planType" required>
                        <option value="قدرات">قدرات</option>
                        <option value="تحصيلي">تحصيلي</option>
                        <option value="عام">عام</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="durationWeeks">المدة (بالأسابيع)</label>
                    <input type="number" id="durationWeeks" name="durationWeeks" min="1" required>
                </div>
                <div class="form-group">
                    <label for="difficultyLevel">مستوى الصعوبة</label>
                    <select id="difficultyLevel" name="difficultyLevel" required>
                        <option value="مبتدئ">مبتدئ</option>
                        <option value="متوسط">متوسط</option>
                        <option value="متقدم">متقدم</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="content">محتوى الخطة</label>
                    <textarea id="content" name="content" rows="8" required></textarea>
                </div>
            `;
            break;
    }
    
    modal.style.display = 'block';
}

// معالجة نموذج المحتوى
function handleContentForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const type = e.target.dataset.type;
    const action = e.target.dataset.action;
    const id = e.target.dataset.id;
    
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    if (action === 'add') {
        addContent(type, data);
    } else if (action === 'edit') {
        updateContent(type, parseInt(id), data);
    }
    
    closeModal('content-modal');
    e.target.reset();
}

// إضافة محتوى جديد
function addContent(type, data) {
    const typeMap = {
        'announcement': 'announcements',
        'achievement': 'achievements',
        'resource': 'resources',
        'study-plan': 'studyPlans'
    };

    const storageKey = typeMap[type];
    const items = getData(storageKey);

    const newItem = {
        id: items.length + 1,
        ...data,
        createdBy: currentUser ? currentUser.username : 'unknown',
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true // جميع المحتويات مرئية دائمًا
    };

    items.push(newItem);
    saveData(storageKey, items);

    // تحديث واجهة المستخدم مباشرة
    loadSectionContent(currentSection);
    showNotification('تم إضافة المحتوى بنجاح', 'success');
}

// تعديل محتوى
function editContent(type, id) {
    if (!canManageContent()) {
        showNotification('ليس لديك صلاحية لتعديل المحتوى', 'error');
        return;
    }
    
    const typeMap = {
        'announcement': 'announcements',
        'achievement': 'achievements',
        'resource': 'resources',
        'study-plan': 'studyPlans'
    };
    
    const storageKey = typeMap[type];
    const items = getData(storageKey);
    const item = items.find(i => i.id === id);
    
    if (!item) {
        showNotification('العنصر غير موجود', 'error');
        return;
    }
    
    // إظهار النموذج مع البيانات المحملة
    showAddForm(type);
    
    // تعبئة النموذج بالبيانات الحالية
    const form = document.getElementById('content-form');
    form.dataset.action = 'edit';
    form.dataset.id = id;
    
    Object.keys(item).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
            field.value = item[key];
        }
    });
    
    document.getElementById('content-modal-title').textContent = `تعديل ${getTypeLabel(type)}`;
}

// تحديث محتوى
function updateContent(type, id, data) {
    const typeMap = {
        'announcement': 'announcements',
        'achievement': 'achievements',
        'resource': 'resources',
        'study-plan': 'studyPlans'
    };

    const storageKey = typeMap[type];
    const items = getData(storageKey);
    const itemIndex = items.findIndex(i => i.id === id);

    if (itemIndex !== -1) {
        items[itemIndex] = {
            ...items[itemIndex],
            ...data,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        saveData(storageKey, items);

        // تحديث واجهة المستخدم مباشرة
        loadSectionContent(currentSection);
        showNotification('تم تحديث المحتوى بنجاح', 'success');
    }
}

// حذف محتوى
function deleteContent(storageKey, id) {
    if (!canManageContent()) {
        showNotification('ليس لديك صلاحية لحذف المحتوى', 'error');
        return;
    }
    
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
        const items = getData(storageKey);
        const filteredItems = items.filter(item => item.id !== id);
        saveData(storageKey, filteredItems);
        loadSectionContent(currentSection);
        showNotification('تم حذف المحتوى بنجاح', 'success');
    }
}

// فلترة المصادر
function filterResources(type) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    currentFilter = type;
    loadResources(type);
}

// عرض خطة المذاكرة
function viewStudyPlan(id) {
    const studyPlans = getData('studyPlans');
    const plan = studyPlans.find(p => p.id === id);
    
    if (plan) {
        alert(`خطة: ${plan.title}\n\nالوصف: ${plan.description}\n\nالمحتوى:\n${plan.content}`);
    }
}

// تحميل محتوى لوحة التحكم
function loadAdminContent() {
    if (!canManageContent()) {
        showNotification('ليس لديك صلاحية للوصول إلى لوحة التحكم', 'error');
        showSection('home');
        return;
    }
    
    showAdminTab('announcements');
}

// عرض تبويب لوحة التحكم
function showAdminTab(tabName) {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    const content = document.getElementById('admin-content');
    
    switch(tabName) {
        case 'announcements':
            content.innerHTML = getAdminAnnouncementsHTML();
            break;
        case 'achievements':
            content.innerHTML = getAdminAchievementsHTML();
            break;
        case 'resources':
            content.innerHTML = getAdminResourcesHTML();
            break;
        case 'study-plans':
            content.innerHTML = getAdminStudyPlansHTML();
            break;
        case 'messages':
            content.innerHTML = getAdminMessagesHTML();
            break;
        case 'users':
            if (currentUser.role === 'admin') {
                content.innerHTML = getAdminUsersHTML();
            } else {
                showNotification('ليس لديك صلاحية لإدارة المستخدمين', 'error');
            }
            break;
    }
}

// HTML لإدارة الإعلانات
function getAdminAnnouncementsHTML() {
    const announcements = getData('announcements');
    return `
        <div class="admin-section">
            <div class="admin-stats">
                <div class="stat-card">
                    <h3>${announcements.length}</h3>
                    <p>إجمالي الإعلانات</p>
                </div>
                <div class="stat-card">
                    <h3>${announcements.filter(a => a.isActive).length}</h3>
                    <p>الإعلانات النشطة</p>
                </div>
            </div>
            <button class="btn-primary" onclick="showAddForm('announcement')">إضافة إعلان جديد</button>
            <div class="content-grid" style="margin-top: 2rem;">
                ${announcements.map(announcement => `
                    <div class="card">
                        <h3>${announcement.title}</h3>
                        <p>${announcement.content.substring(0, 100)}...</p>
                        <div class="card-meta">
                            <span>${announcement.createdBy}</span>
                            <span>${formatDate(announcement.createdAt)}</span>
                            <span class="badge ${announcement.isActive ? 'badge-success' : 'badge-info'}">${announcement.isActive ? 'نشط' : 'غير نشط'}</span>
                        </div>
                        <div class="card-actions">
                            <button class="btn-small btn-edit" onclick="editContent('announcement', ${announcement.id})">تعديل</button>
                            <button class="btn-small btn-delete" onclick="deleteContent('announcements', ${announcement.id})">حذف</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// HTML لإدارة الإنجازات
function getAdminAchievementsHTML() {
    const achievements = getData('achievements');
    return `
        <div class="admin-section">
            <div class="admin-stats">
                <div class="stat-card">
                    <h3>${achievements.length}</h3>
                    <p>إجمالي الإنجازات</p>
                </div>
                <div class="stat-card">
                    <h3>${achievements.filter(a => a.isActive).length}</h3>
                    <p>الإنجازات النشطة</p>
                </div>
            </div>
            <button class="btn-primary" onclick="showAddForm('achievement')">إضافة إنجاز جديد</button>
            <div class="content-grid" style="margin-top: 2rem;">
                ${achievements.map(achievement => `
                    <div class="card">
                        <h3>${achievement.title}</h3>
                        <p><strong>الطالب:</strong> ${achievement.studentName}</p>
                        <p>${achievement.description.substring(0, 100)}...</p>
                        <div class="card-meta">
                            <span>${achievement.createdBy}</span>
                            <span>${formatDate(achievement.achievementDate)}</span>
                        </div>
                        <div class="card-actions">
                            <button class="btn-small btn-edit" onclick="editContent('achievement', ${achievement.id})">تعديل</button>
                            <button class="btn-small btn-delete" onclick="deleteContent('achievements', ${achievement.id})">حذف</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// HTML لإدارة المصادر
function getAdminResourcesHTML() {
    const resources = getData('resources');
    return `
        <div class="admin-section">
            <div class="admin-stats">
                <div class="stat-card">
                    <h3>${resources.length}</h3>
                    <p>إجمالي المصادر</p>
                </div>
                <div class="stat-card">
                    <h3>${resources.filter(r => r.isActive).length}</h3>
                    <p>المصادر النشطة</p>
                </div>
            </div>
            <button class="btn-primary" onclick="showAddForm('resource')">إضافة مصدر جديد</button>
            <div class="content-grid" style="margin-top: 2rem;">
                ${resources.map(resource => `
                    <div class="card">
                        <h3>${resource.title}</h3>
                        <p>${resource.description || ''}</p>
                        <div class="card-meta">
                            <span class="badge badge-primary">${resource.category}</span>
                            <span class="badge badge-info">${getResourceTypeLabel(resource.resourceType)}</span>
                            <span>${resource.createdBy}</span>
                        </div>
                        <div class="card-actions">
                            <button class="btn-small btn-edit" onclick="editContent('resource', ${resource.id})">تعديل</button>
                            <button class="btn-small btn-delete" onclick="deleteContent('resources', ${resource.id})">حذف</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// HTML لإدارة خطط المذاكرة
function getAdminStudyPlansHTML() {
    const studyPlans = getData('studyPlans');
    return `
        <div class="admin-section">
            <div class="admin-stats">
                <div class="stat-card">
                    <h3>${studyPlans.length}</h3>
                    <p>إجمالي الخطط</p>
                </div>
                <div class="stat-card">
                    <h3>${studyPlans.filter(p => p.isActive).length}</h3>
                    <p>الخطط النشطة</p>
                </div>
            </div>
            <button class="btn-primary" onclick="showAddForm('study-plan')">إضافة خطة جديدة</button>
            <div class="content-grid" style="margin-top: 2rem;">
                ${studyPlans.map(plan => `
                    <div class="card">
                        <h3>${plan.title}</h3>
                        <p>${plan.description || ''}</p>
                        <div class="card-meta">
                            <span class="badge badge-primary">${plan.planType}</span>
                            <span class="badge badge-info">${plan.difficultyLevel}</span>
                            <span>${plan.durationWeeks} أسابيع</span>
                        </div>
                        <div class="card-actions">
                            <button class="btn-small btn-view" onclick="viewStudyPlan(${plan.id})">عرض</button>
                            <button class="btn-small btn-edit" onclick="editContent('study-plan', ${plan.id})">تعديل</button>
                            <button class="btn-small btn-delete" onclick="deleteContent('studyPlans', ${plan.id})">حذف</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// HTML لإدارة الرسائل
function getAdminMessagesHTML() {
    const messages = getData('messages');
    return `
        <div class="admin-section">
            <div class="admin-stats">
                <div class="stat-card">
                    <h3>${messages.length}</h3>
                    <p>إجمالي الرسائل</p>
                </div>
                <div class="stat-card">
                    <h3>${messages.filter(m => !m.isRead).length}</h3>
                    <p>الرسائل غير المقروءة</p>
                </div>
            </div>
            <div class="content-grid" style="margin-top: 2rem;">
                ${messages.length === 0 ? '<div class="empty-state"><i class="fas fa-envelope"></i><p>لا توجد رسائل</p></div>' : 
                messages.map(message => `
                    <div class="card ${!message.isRead ? 'unread' : ''}">
                        <h3>${message.subject}</h3>
                        <p><strong>من:</strong> ${message.name} (${message.email})</p>
                        <p>${message.message.substring(0, 150)}...</p>
                        <div class="card-meta">
                            <span>${formatDate(message.createdAt)}</span>
                            <span class="badge ${message.isRead ? 'badge-success' : 'badge-info'}">${message.isRead ? 'مقروءة' : 'غير مقروءة'}</span>
                        </div>
                        <div class="card-actions">
                            <button class="btn-small btn-view" onclick="viewMessage(${message.id})">عرض</button>
                            ${!message.isRead ? `<button class="btn-small btn-edit" onclick="markAsRead(${message.id})">تحديد كمقروءة</button>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// HTML لإدارة المستخدمين
function getAdminUsersHTML() {
    const users = getData('users');
    return `
        <div class="admin-section">
            <div class="admin-stats">
                <div class="stat-card">
                    <h3>${users.length}</h3>
                    <p>إجمالي المستخدمين</p>
                </div>
                <div class="stat-card">
                    <h3>${users.filter(u => u.isActive).length}</h3>
                    <p>المستخدمين النشطين</p>
                </div>
                <div class="stat-card">
                    <h3>${users.filter(u => u.role === 'admin').length}</h3>
                    <p>المدراء</p>
                </div>
                <div class="stat-card">
                    <h3>${users.filter(u => u.role === 'moderator').length}</h3>
                    <p>المشرفين</p>
                </div>
            </div>
            <div class="content-grid" style="margin-top: 2rem;">
                ${users.map(user => `
                    <div class="card">
                        <h3>${user.username}</h3>
                        <p><strong>البريد:</strong> ${user.email}</p>
                        <div class="card-meta">
                            <span class="badge badge-primary">${getRoleLabel(user.role)}</span>
                            <span class="badge ${user.isActive ? 'badge-success' : 'badge-info'}">${user.isActive ? 'نشط' : 'غير نشط'}</span>
                            <span>${formatDate(user.createdAt)}</span>
                        </div>
                        ${user.username !== 'abdullah_admin' ? `
                            <div class="card-actions">
                                <button class="btn-small ${user.isActive ? 'btn-delete' : 'btn-edit'}" onclick="toggleUserStatus(${user.id})">${user.isActive ? 'إلغاء تفعيل' : 'تفعيل'}</button>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// عرض رسالة
function viewMessage(id) {
    const messages = getData('messages');
    const message = messages.find(m => m.id === id);
    
    if (message) {
        alert(`من: ${message.name}\nالبريد: ${message.email}\nالموضوع: ${message.subject}\n\nالرسالة:\n${message.message}`);
        
        if (!message.isRead) {
            markAsRead(id);
        }
    }
}

// تحديد الرسالة كمقروءة
function markAsRead(id) {
    const messages = getData('messages');
    const messageIndex = messages.findIndex(m => m.id === id);
    
    if (messageIndex !== -1) {
        messages[messageIndex].isRead = true;
        saveData('messages', messages);
        showAdminTab('messages');
        showNotification('تم تحديد الرسالة كمقروءة', 'success');
    }
}

// تبديل حالة المستخدم
function toggleUserStatus(id) {
    if (currentUser.role !== 'admin') {
        showNotification('ليس لديك صلاحية لتعديل المستخدمين', 'error');
        return;
    }
    
    const users = getData('users');
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex !== -1) {
        users[userIndex].isActive = !users[userIndex].isActive;
        saveData('users', users);
        showAdminTab('users');
        showNotification(`تم ${users[userIndex].isActive ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم`, 'success');
    }
}

// وظائف مساعدة
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

function getResourceTypeLabel(type) {
    const labels = {
        'pdf': 'ملف PDF',
        'video': 'فيديو',
        'link': 'رابط خارجي'
    };
    return labels[type] || type;
}

function getRoleLabel(role) {
    const labels = {
        'admin': 'مدير',
        'moderator': 'مشرف',
        'user': 'مستخدم'
    };
    return labels[role] || role;
}

function getTypeLabel(type) {
    const labels = {
        'announcement': 'الإعلان',
        'achievement': 'الإنجاز',
        'resource': 'المصدر',
        'study-plan': 'خطة المذاكرة'
    };
    return labels[type] || type;
}

function canManageContent() {
    return currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator');
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}