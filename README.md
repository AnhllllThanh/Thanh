"# AnhllThanh"  
<!DOCTYPE html>
<html lang="vi">
<head>
  <title>Login</title>
  <style>
body {
    font-family: sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f4f4f4;
}

.container {
    background-color: #fff;
    padding: 30px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    width: 350px;
}

h1 {
    text-align: center;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
}

input[type="text"], input[type="password"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-sizing: border-box;
}

button[type="submit"] {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    width: 30%;
}

button[type="submit"]:hover {
    background-color: #45a049;
}
</style>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="container">
    <center><h1>Đăng nhập tài khoản</h1>
    <% if (error) { %>
      <div class="error"><%= error %></div>
    <% } %> 
    <form method="POST" action="/login">
      <div class="form-group">
        <label for="username">Tài khoản:</label>
        <input type="text" id="username" name="username" required>
      </div>
	  <br>
      <div class="form-group">
        <center><label for="password">Mật khẩu:</label>
        <input type="password" id="password" name="password" required>
      </div>
	   <input type="checkbox" id="remember-me" name="remember-me">
            <label for="remember-me">Ghi nhớ đăng nhập</label>
	  <br>
      <center>
	 <button type="submit">đăng nhập</button>&emsp;
	 <a href= " http://localhost:8080/register " > <button type="submit">đăng ký</button> </a>
    </form>
  </div>
  <script src="script.js"></script>
</body>
</html>
