
// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyAXZKdkx72F2GvM7qaynr5r9agAMAiVX2s",
    authDomain: "commonpjt-fd9ed.firebaseapp.com",
    databaseURL: "https://commonpjt-fd9ed-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "commonpjt-fd9ed",
    storageBucket: "commonpjt-fd9ed.firebasestorage.app",
    messagingSenderId: "653463134970",
    appId: "1:653463134970:web:8301b6f3a2bde8da201f43"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM 요소들
const mainScreen = document.getElementById('main-screen');
const detailScreen = document.getElementById('detail-screen');
const usersGrid = document.getElementById('users-grid');
const backBtn = document.getElementById('back-btn');
const userName = document.getElementById('user-name');
const userId = document.getElementById('user-id');
const lastTimestamp = document.getElementById('last-timestamp');
const sensorData = document.getElementById('sensor-data');

let currentUsers = {};

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    backBtn.addEventListener('click', () => {
        showMainScreen();
    });
}

// Firebase에서 사용자 데이터 로드
function loadUsers() {
    const usersRef = database.ref('/');
    
    usersRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            currentUsers = data;
            displayUsers(data);
        } else {
            showError('데이터를 찾을 수 없습니다.');
        }
    }, (error) => {
        showError('데이터 로딩 중 오류가 발생했습니다: ' + error.message);
    });
}

// 사용자 목록 표시
function displayUsers(users) {
    usersGrid.innerHTML = '';
    let userCount = 0;
    
    Object.keys(users).forEach(userKey => {
        const userData = users[userKey];
        if (userData.info && userData.sensehat) {
            const userCard = createUserCard(userKey, userData);
            usersGrid.appendChild(userCard);
            userCount++;
        }
    });
    
    // 사용자 수 업데이트
    const userCountElement = document.getElementById('user-count');
    userCountElement.textContent = `💻 등록된 기기: ${userCount}대`;
}

// 사용자 카드 생성
function createUserCard(userKey, userData) {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.onclick = () => showUserDetail(userKey, userData);
    
    const name = userKey;
    const studentId = userData.info.학번 || 'N/A';
    
    card.innerHTML = `
        <div class="user-name">${name}</div>
        <div class="user-id">학번: ${studentId}</div>
    `;
    
    return card;
}

// 사용자 상세 정보 표시
function showUserDetail(userKey, userData) {
    userName.textContent = userKey;
    userId.textContent = `학번: ${userData.info.학번 || 'N/A'}`;
    
    // 타임스탬프 표시
    if (userData.sensehat.timestamp) {
        const timestamp = new Date(userData.sensehat.timestamp);
        lastTimestamp.textContent = timestamp.toLocaleString('ko-KR');
    } else {
        lastTimestamp.textContent = 'N/A';
    }
    
    // 센서 데이터 표시
    displaySensorData(userData.sensehat);
    
    // 화면 전환
    mainScreen.classList.remove('active');
    detailScreen.classList.add('active');
}

// 센서 데이터 상세 표시
function displaySensorData(sensehat) {
    sensorData.innerHTML = '';
    
    // 온도
    if (sensehat.temperature !== undefined) {
        sensorData.appendChild(createSensorCard(
            'temperature', 
            '🌡️ 온도', 
            sensehat.temperature.toFixed(2), 
            '°C'
        ));
    }
    
    // 습도
    if (sensehat.humidity !== undefined) {
        sensorData.appendChild(createSensorCard(
            'humidity', 
            '💧 습도', 
            sensehat.humidity.toFixed(2), 
            '%'
        ));
    }
    
    // 기압
    if (sensehat.pressure !== undefined) {
        sensorData.appendChild(createSensorCard(
            'pressure', 
            '🌪️ 기압', 
            sensehat.pressure.toFixed(2), 
            'hPa'
        ));
    }
    
    // 가속도계
    if (sensehat.accel) {
        sensorData.appendChild(createAxisSensorCard(
            'accel', 
            '📈 가속도계', 
            sensehat.accel,
            'g'
        ));
    }
    
    // 자이로스코프
    if (sensehat.gyro) {
        sensorData.appendChild(createAxisSensorCard(
            'gyro', 
            '🔄 자이로스코프', 
            sensehat.gyro,
            'rad/s'
        ));
    }
}

// 일반 센서 카드 생성
function createSensorCard(className, title, value, unit) {
    const card = document.createElement('div');
    card.className = `sensor-card ${className}`;
    
    card.innerHTML = `
        <div class="sensor-title">${title}</div>
        <div class="sensor-value">${value}</div>
        <div class="sensor-unit">${unit}</div>
    `;
    
    return card;
}

// 3축 센서 카드 생성 (가속도계, 자이로스코프)
function createAxisSensorCard(className, title, data, unit) {
    const card = document.createElement('div');
    card.className = `sensor-card ${className}`;
    
    card.innerHTML = `
        <div class="sensor-title">${title}</div>
        <div class="axis-data">
            <div class="axis-item">
                <div class="axis-label">X축</div>
                <div class="axis-value">${data.x ? data.x.toFixed(4) : 'N/A'}</div>
            </div>
            <div class="axis-item">
                <div class="axis-label">Y축</div>
                <div class="axis-value">${data.y ? data.y.toFixed(4) : 'N/A'}</div>
            </div>
            <div class="axis-item">
                <div class="axis-label">Z축</div>
                <div class="axis-value">${data.z ? data.z.toFixed(4) : 'N/A'}</div>
            </div>
        </div>
        <div class="sensor-unit">${unit}</div>
    `;
    
    return card;
}

// 메인 화면으로 돌아가기
function showMainScreen() {
    detailScreen.classList.remove('active');
    mainScreen.classList.add('active');
}

// 에러 메시지 표시
function showError(message) {
    usersGrid.innerHTML = `
        <div class="error">
            ${message}
        </div>
    `;
}

// 실시간 업데이트를 위한 함수 (선택사항)
function setupRealtimeUpdates(userKey) {
    const userRef = database.ref(`/${userKey}/sensehat`);
    userRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && detailScreen.classList.contains('active')) {
            displaySensorData(data);
            if (data.timestamp) {
                const timestamp = new Date(data.timestamp);
                lastTimestamp.textContent = timestamp.toLocaleString('ko-KR');
            }
        }
    });
}
