const form = document.getElementById('login-form');
const rememberMeCheckbox = document.getElementById('remember-me');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Kiểm tra thông tin đăng nhập (thay thế bằng logic xác thực của bạn)
    if (username === 'admin' && password === '1234') {
        alert('Đăng nhập thành công!');
  
        // Lưu thông tin đăng nhập nếu người dùng chọn 'Ghi nhớ đăng nhập'
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
        } else {
            localStorage.removeItem('username');
            localStorage.removeItem('password');
        }

        // Chuyển hướng đến trang chủ hoặc trang tiếp theo
        // window.location.href = 'index.html'; 
    } else {
        alert('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
});

// Kiểm tra xem đã có thông tin đăng nhập được lưu hay chưa khi trang tải
window.onload = () => {
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');

    if (savedUsername && savedPassword) {
        // Điền thông tin đăng nhập vào form
        document.getElementById('username').value = savedUsername;
        document.getElementById('password').value = savedPassword;
        rememberMeCheckbox.checked = true;
    }
};