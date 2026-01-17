/* =========================================
   1. MOCK DATABASE (Simulating an API)
   ========================================= */
const DB_VERSION = "2.1";
const FoodDatabase = [
    { id: 1, name: "Apple", cals: 52, pro: 0.3, carb: 14, fat: 0.2, type: "light", digest: "45 mins" },
    { id: 2, name: "Banana", cals: 89, pro: 1.1, carb: 22.8, fat: 0.3, type: "light", digest: "45 mins" },
    { id: 3, name: "Chicken Biryani", cals: 292, pro: 12, carb: 35, fat: 11, type: "heavy", digest: "3-4 hours" },
    { id: 4, name: "Dal Makhani", cals: 300, pro: 10, carb: 25, fat: 18, type: "heavy", digest: "4 hours" },
    { id: 5, name: "Oatmeal", cals: 68, pro: 2.4, carb: 12, fat: 1.4, type: "medium", digest: "2 hours" },
    { id: 6, name: "Grilled Chicken", cals: 165, pro: 31, carb: 0, fat: 3.6, type: "medium", digest: "2.5 hours" },
    { id: 7, name: "Paneer Tikka", cals: 260, pro: 18, carb: 6, fat: 19, type: "heavy", digest: "4 hours" },
    { id: 8, name: "Rice (White)", cals: 130, pro: 2.7, carb: 28, fat: 0.3, type: "medium", digest: "2 hours" },
    { id: 9, name: "Chapati", cals: 120, pro: 3, carb: 18, fat: 4, type: "medium", digest: "2 hours" },
    { id: 10, name: "Egg (Boiled)", cals: 155, pro: 13, carb: 1.1, fat: 11, type: "light", digest: "1.5 hours" }
];

/* =========================================
   2. APP CONTROLLER (Class Based)
   ========================================= */
class NutriApp {
    constructor() {
        // State
        this.user = JSON.parse(localStorage.getItem('nutri_user')) || null;
        this.dailyLog = JSON.parse(localStorage.getItem('nutri_log')) || [];
        this.lastReset = localStorage.getItem('nutri_date') || new Date().toDateString();
        
        // Goals (Default)
        this.goals = { cals: 2000, pro: 150, carb: 250, fat: 70 };
        
        // Check date for reset
        this.checkDateReset();
        
        // Init
        this.initUI();
        this.renderStats();
    }

    // --- INITIALIZATION ---
    initUI() {
        // Nav Listeners
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.target;
                this.switchView(target);
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Camera Listener
        document.getElementById('cameraInput').addEventListener('change', (e) => this.handleImage(e));

        // Profile Form Listener
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createProfile();
        });

        // Show onboarding if no user
        if (!this.user) {
            document.getElementById('onboardingModal').classList.add('active');
        } else {
            this.calculateGoals(); // Recalc based on saved user
        }

        this.renderLogList();
    }

    // --- CORE LOGIC ---
    checkDateReset() {
        const today = new Date().toDateString();
        if (this.lastReset !== today) {
            this.dailyLog = []; // Reset logs for new day
            this.lastReset = today;
            this.saveData();
            alert("New Day! Calorie Tracker Reset.");
        }
    }

    createProfile() {
        const weight = parseFloat(document.getElementById('userWeight').value);
        const height = parseFloat(document.getElementById('userHeight').value);
        const age = parseFloat(document.getElementById('userAge').value);
        const gender = document.getElementById('userGender').value;

        this.user = { weight, height, age, gender };
        this.calculateGoals();
        this.saveData();
        
        document.getElementById('onboardingModal').classList.remove('active');
    }

    calculateGoals() {
        // BMR Calculation (Mifflin-St Jeor Equation)
        let bmr;
        if (this.user.gender === 'male') {
            bmr = 10 * this.user.weight + 6.25 * this.user.height - 5 * this.user.age + 5;
        } else {
            bmr = 10 * this.user.weight + 6.25 * this.user.height - 5 * this.user.age - 161;
        }
        
        // TDEE (Sedentary Multiplier for now)
        const tdee = Math.round(bmr * 1.2);
        this.goals.cals = tdee;
        
        // Macro Split (30% P / 40% C / 30% F)
        this.goals.pro = Math.round((tdee * 0.3) / 4);
        this.goals.carb = Math.round((tdee * 0.4) / 4);
        this.goals.fat = Math.round((tdee * 0.3) / 9);

        // Update UI Text
        document.querySelector('.ring-text small').innerText = `Goal: ${tdee}`;
    }

    // --- SCANNING & AI MOCK ---
    handleImage(e) {
        const file = e.target.files[0];
        if (file) {
            // Preview
            const reader = new FileReader();
            reader.onload = (ev) => {
                document.getElementById('imagePreview').src = ev.target.result;
                document.getElementById('imagePreview').style.opacity = "1";
            }
            reader.readAsDataURL(file);

            // Simulate AI Processing
            const btn = document.querySelector('.camera-trigger');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
            
            setTimeout(() => {
                this.simulateDetection();
                btn.innerHTML = '<i class="fas fa-shutter"></i> Tap to Capture';
            }, 2000);
        }
    }

    simulateDetection() {
        // Randomly pick food from database
        const randomFood = FoodDatabase[Math.floor(Math.random() * FoodDatabase.length)];
        this.currentScannedFood = randomFood;
        this.showResultModal(randomFood);
    }

    handleSearch() {
        const query = document.getElementById('manualSearchInput').value.toLowerCase();
        const found = FoodDatabase.find(f => f.name.toLowerCase().includes(query));
        if (found) {
            this.currentScannedFood = found;
            this.showResultModal(found);
            document.getElementById('manualSearchInput').value = '';
        } else {
            alert("Food not found. Try 'Apple', 'Rice', 'Chicken'...");
        }
    }

    showResultModal(food) {
        document.getElementById('resName').innerText = food.name;
        document.getElementById('resCal').innerText = food.cals + " kcal";
        document.getElementById('resPro').innerText = food.pro + "g";
        document.getElementById('resCarb').innerText = food.carb + "g";
        document.getElementById('resDigest').innerText = food.digest;
        
        const badge = document.getElementById('resHeavy');
        badge.innerText = food.type.toUpperCase();
        badge.className = `badge ${food.type === 'heavy' ? 'bg-red' : 'bg-green'}`;

        document.getElementById('scanResult').classList.remove('hidden');
    }

    discardScan() {
        document.getElementById('scanResult').classList.add('hidden');
        document.getElementById('imagePreview').src = "";
        document.getElementById('imagePreview').style.opacity = "0.6";
    }

    // --- TRACKING ---
    saveFood() {
        if (!this.currentScannedFood) return;

        const entry = {
            ...this.currentScannedFood,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            id: Date.now() // Unique ID for log
        };

        this.dailyLog.push(entry);
        this.saveData();
        this.renderStats();
        this.renderLogList();
        this.discardScan();
        this.switchView('dashboard');
        
        // Show success animation or toast here (omitted for brevity)
    }

    // --- RENDERING & STORAGE ---
    renderStats() {
        // Calculate Totals
        const totals = this.dailyLog.reduce((acc, item) => {
            acc.cals += item.cals;
            acc.pro += item.pro;
            acc.carb += item.carb;
            acc.fat += item.fat;
            return acc;
        }, { cals: 0, pro: 0, carb: 0, fat: 0 });

        // Update Dashboard Numbers
        document.getElementById('dashProtein').innerText = Math.round(totals.pro) + " / " + this.goals.pro + "g";
        document.getElementById('dashCarbs').innerText = Math.round(totals.carb) + " / " + this.goals.carb + "g";
        document.getElementById('dashFat').innerText = Math.round(totals.fat) + " / " + this.goals.fat + "g";

        // Update Ring Chart
        const remaining = Math.max(0, this.goals.cals - totals.cals);
        document.getElementById('displayCals').innerText = Math.round(remaining);
        
        const percent = Math.min((totals.cals / this.goals.cals) * 100, 100);
        const dashOffset = 100 - percent;
        document.getElementById('calCircle').style.strokeDasharray = `${percent}, 100`;
        
        // Color logic
        if(percent > 100) document.getElementById('calCircle').style.stroke = "#ef4444"; // Red if over
    }

    renderLogList() {
        const list = document.getElementById('recentList');
        const fullList = document.getElementById('fullLogList');
        list.innerHTML = '';
        fullList.innerHTML = '';

        if (this.dailyLog.length === 0) {
            list.innerHTML = '<li class="empty-state">No food tracked yet today.</li>';
            fullList.innerHTML = '<p style="text-align:center; color:#666;">Empty Log</p>';
            return;
        }

        // Render logs
        // We reverse array to show newest first
        [...this.dailyLog].reverse().forEach(item => {
            const html = `
                <li>
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>${item.time} • ${item.cals} kcal</small>
                    </div>
                    <span>${item.pro}g P</span>
                </li>
            `;
            // Add to Dashboard (limit 3)
            if (list.children.length < 3) list.innerHTML += html;
            // Add to Logs
            fullList.innerHTML += html;
        });
    }

    switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
    }

    saveData() {
        localStorage.setItem('nutri_user', JSON.stringify(this.user));
        localStorage.setItem('nutri_log', JSON.stringify(this.dailyLog));
        localStorage.setItem('nutri_date', this.lastReset);
    }

    clearHistory() {
        if(confirm("Delete all history?")) {
            this.dailyLog = [];
            this.saveData();
            this.renderStats();
            this.renderLogList();
        }
    }
    
    resetProfile() {
        if(confirm("Reset entire app?")) {
            localStorage.clear();
            location.reload();
        }
    }
}

// Start App
const app = new NutriApp();
                                                                
