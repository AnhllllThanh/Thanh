<center><h1>Hãy làm nhiệm vụ hôm nay</h1></center>
<title>Cập Nhật Ngày Tháng</title>



<center><p id="datetime"></p>

<script>
  const datetime = document.getElementById('datetime');

  function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }; // Không bao gồm giờ, phút, giây
    datetime.textContent = now.toLocaleDateString('vi-VN', options);
  }

  // Cập nhật ngày tháng mỗi giây
  setInterval(updateDateTime, 1000);

  // Gọi hàm cập nhật ban đầu khi trang web được tải
  updateDateTime();
</script>





<title>Nút Gắn Link với Giới Hạn</title>
<style>
  .button {
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
  }
</style>



  <a href="https://yeumoney.com/LnXBTuk" id="myButton" class="button">Nhận làm luôn!</a>

  <p id="message"></p>

  <script>
    const button = document.getElementById('myButton');
    const message = document.getElementById('message');

    // Giới hạn số lần truy cập
    const maxClicksPerDay = 3; // Thay đổi giá trị này nếu muốn thay đổi giới hạn

    // Xác định thiết bị
    const deviceID = getDeviceID();

    // Hàm để lấy ID thiết bị
    function getDeviceID() {
      return navigator.userAgent; // Sử dụng User-Agent để phân biệt thiết bị
    }

    // Hàm để lấy ngày hiện tại
    function getToday() {
      const today = new Date();
      return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    }

    // Lấy số lần nhấn từ localStorage
    let clicksToday = parseInt(localStorage.getItem(deviceID + '_' + getToday()));
    if (isNaN(clicksToday)) {
      clicksToday = 0;
    }

    // Thêm sự kiện click cho nút
    button.addEventListener('click', () => {
      // Kiểm tra xem đã đạt giới hạn số lần nhấn chưa
      if (clicksToday >= maxClicksPerDay) {
        message.textContent = "Bạn đã đạt giới hạn số lần làm nhiệm vụ trong ngày.";
        button.href = 'javascript:void(0);'; // Ngăn chặn truy cập link
        return;
      }

      // Tăng số lần nhấn
      clicksToday++;

      // Lưu trữ số lần nhấn vào localStorage
      localStorage.setItem(deviceID + '_' + getToday(), clicksToday);

      // Hiển thị thông báo số lần nhấn
      message.textContent = `Bạn đã làm ${clicksToday} nhiệm vụ trong ngày.`;

      // Kiểm tra xem đã đạt giới hạn số lần nhấn chưa
      if (clicksToday >= maxClicksPerDay) {
        message.textContent = "Bạn đã đạt giới hạn số lần làm nhiệm vụ trong ngày.";
        button.href = 'javascript:void(0);'; // Ngăn chặn truy cập link
      }
    });
  </script></h1></center>
