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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 22H18V20C18 18.3431 16.6569 17 15 17H9C7.34315 17 6 18.3431 6 20V22H4V20C4 17.2386 6.23858 15 9 15H15C17.7614 15 20 17.2386 20 20V22ZM12 13C8.68629 13 6 10.3137 6 7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7C18 10.3137 15.3137 13 12 13ZM12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"></path></svg>
           
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
