function ShowLogin() {
  var li = document.querySelectorAll("#navbarAccount");
  if (li) {
    var token = JSON.parse(sessionStorage.getItem("token"));

    li.forEach((element) => {
      if (!token) {
        element.innerHTML = ` `;
        element.innerHTML = `
        <div class="header-action-icon-2">
          <a href="login.html">
            <img class="svgInject" alt="Nest" src="assets/imgs/theme/icons/icon-user.svg" />
           
            <span class="lable ml-0" style="font-size:large;">SignIn</span>
          </a>
          <span >/</span>
          <a href="register.html"><span class="lable ml-0" style="font-size:large;">SignUp</span></a>
        </div>`;
      }
    });
  }
}

async function LogOut() {
  debugger;
  var token = JSON.parse(sessionStorage.getItem("token"));

  if (!token) {
    return;
  }
  token = token.refreshToken;

  var url = `https://localhost:7162/api/Auth/LogOut?refreshToken=${token}`;

  var res = await fetchToBack(url, "GET", null);

  if (res && res.success == true) {
    sessionStorage.removeItem("token");
    window.location.href = "./index.html";
  }
}

async function fetchToBack(url, method, data) {
  debugger;
  return await fetch(url, {
    method: method,
    body: data ? data : null,
  })
    .then((response) => response.json())
    .then((data) => {
      debugger;
      if (!data || !data.success) {
        if (!data.message) {
          data.message = "internal server error";
        }
        Swal.fire({
          position: "top-end",
          icon: "warning",
          title: data.message,
          timer: 2000,
          showConfirmButton: false,
        });
        return data;
      } else {
        return data;
      }
    })
    .catch((err) => {
      debugger;
      hideSpinner();
      Swal.fire({
        position: "top-end",
        icon: "warning",
        title: "something went wrong",
        timer: 2000,
        showConfirmButton: false,
      });
    });
}

document.addEventListener("DOMContentLoaded", function () {
  ShowLogin();
});
