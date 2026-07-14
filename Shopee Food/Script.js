document.addEventListener('DOMContentLoaded', () => {
    
    function navigateTo(url) {
        document.body.classList.add('page-exit');
        document.body.addEventListener('animationend', () => {
            window.location.href = url;
        }, { once: true });
    }

    function goBack() {
        document.body.classList.add('page-exit-back');
        document.body.addEventListener('animationend', () => {
            window.history.back();
        }, { once: true });
    }

    const foodContainers = document.querySelectorAll('.food-container');
    foodContainers.forEach(container => {
        container.addEventListener('click', () => {
            navigateTo('menu.html');
        });
    });

    const addBtns = document.querySelectorAll('.add-btn');
    addBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo('cart.html');
        });
    });

    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
        cartLink.addEventListener('click', () => {
            navigateTo('cart.html');
        });
    }

    const toCheckoutBtn = document.querySelector('.checkout-btn');
    if (toCheckoutBtn) {
        toCheckoutBtn.addEventListener('click', () => {
            navigateTo('checkout.html');
        });
    }

    const placeOrderBtn = document.querySelector('.fixed-bottom-bar button:not(.home-btn):not(.checkout-btn)');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', () => {
            navigateTo('success.html');
        });
    }

    const homeBtn = document.querySelector('.home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            navigateTo('index.html');
        });
    }

    const backBtns = document.querySelectorAll('.header button, .simple-header button, .store-header button');
    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            goBack();
        });
    });

    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            const radio = option.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });
    // --- Login/Register Popup Logic ---
    const overlay = document.getElementById('overlay');
    const loginMenu = document.getElementById('loginMenu');
    const registerMenu = document.getElementById('registerMenu');
    const closeButtons = document.querySelectorAll('.popup-close');
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    function openPopup() {
        if(overlay) overlay.style.display = 'flex';
    }

    function closePopup() {
        if(overlay) overlay.style.display = 'none';
    }

    function showLogin() {
        if(loginBox) loginBox.style.display = 'block';
        if(registerBox) registerBox.style.display = 'none';
    }

    function showRegister() {
        if(loginBox) loginBox.style.display = 'none';
        if(registerBox) registerBox.style.display = 'block';
    }

    if(loginMenu) loginMenu.addEventListener('click', () => { openPopup(); showLogin(); });
    if(registerMenu) registerMenu.addEventListener('click', () => { openPopup(); showRegister(); });
    closeButtons.forEach(btn => btn.addEventListener('click', closePopup));
    if(showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
    if(showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });

    if(registerBtn) {
        registerBtn.addEventListener('click', () => {
            const name = document.getElementById('regName').value;
            const phone = document.getElementById('regPhone').value;
            const pass = document.getElementById('regPass').value;

            if (!name || !phone || !pass) {
                alert("Vui lòng nhập đủ thông tin!");
                return;
            }
            const user = { name, phone, pass };
            localStorage.setItem("shopeeUser", JSON.stringify(user));
            alert("Đăng ký thành công!");
            showLogin();
        });
    }

    if(loginBtn) {
        loginBtn.addEventListener('click', () => {
            const phone = document.getElementById('loginPhone').value;
            const pass = document.getElementById('loginPass').value;
            const user = JSON.parse(localStorage.getItem("shopeeUser"));

            if (!user) {
                alert("Chưa có tài khoản!");
                return;
            }

            if (phone === user.phone && pass === user.pass) {
                localStorage.setItem("isShopeeLogin", "true");
                closePopup();
                updateHeader();
            } else {
                alert("Sai số điện thoại hoặc mật khẩu!");
            }
        });
    }

    function updateHeader() {
        const user = JSON.parse(localStorage.getItem("shopeeUser"));
        const isLogin = localStorage.getItem("isShopeeLogin");
        const userNameArea = document.getElementById('userNameArea');

        if (isLogin === "true" && user) {
            if(loginMenu) loginMenu.style.display = 'none';
            if(registerMenu) registerMenu.style.display = 'none';
            if(userNameArea) {
                userNameArea.style.display = 'inline';
                userNameArea.textContent = '👤 ' + user.name;
            }
            if(logoutBtn) logoutBtn.style.display = 'inline';
        }
    }

    if(logoutBtn) logoutBtn.addEventListener('click', () => {
        localStorage.setItem("isShopeeLogin", "false");
        window.location.reload();
    });

    updateHeader();
});