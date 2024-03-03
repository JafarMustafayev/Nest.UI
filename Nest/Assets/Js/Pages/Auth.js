async function fetchToBack(url, method, data) {
  return await fetch(url, {
    method: method,
    body: data ? data : null,
  })
    .then((response) => response.json())
    .then((data) => {
      debugger;
      if (!data || !data.success) {
        debugger;
        if (!data.message) {
          data.message = "internall server error";
        }
        Swal.fire({
          position: "top-end",
          icon: "warning",
          title: data.message,
          timer: 2000,
          showConfirmButton: false,
        });
        console.log(data);
        return data;
      } else {
        return data;
      }
    })
    .catch((err) => {
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

//#region Capture form data

function captureRegisterData() {
  var form = document.getElementById("registerForm");
  if (form) {
    var formData = new FormData(form);

    var fullName = document.getElementById("FullNameInput").value;
    var username = document.getElementById("UserNameInput").value;
    var email = document.getElementById("EmailInput").value;
    var phoneNumber = document.getElementById("PhoneNumberInput").value;
    var password = document.getElementById("PasswordInput").value;
    var confirmedPassword = document.getElementById(
      "ConfirmPasswordInput"
    ).value;

    var status = true;
    if (confirmedPassword != "" && password != "") {
      if (confirmedPassword != password) {
        var span = document.getElementById("ConfirmPasswordInputSpan");
        span.innerHTML = "Password does not match";
        status = false;
      } else {
        var span = document.getElementById("ConfirmPasswordInputSpan");
        span.innerHTML = "";
      }
    } else {
      var span = document.getElementById("ConfirmPasswordInputSpan");
      span.innerHTML = "This field is required";
      status = false;
    }

    formData.append("FullName", fullName);
    formData.append("UserName", username);
    formData.append("PhoneNumber", phoneNumber);
    formData.append("Email", email);
    formData.append("Password", confirmedPassword);

    for (const [key, value] of formData) {
      var span = document.getElementById(key + "InputSpan");
      if (value == "" && key != "PhoneNumber" && key != "Password") {
        status = false;
        span.innerHTML = "This field is required";
      } else {
        span.innerHTML = "";
      }

      if (key == "Email") {
        if (formData.get("Email")) {
          if (
            !RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).test(
              formData.get("Email")
            )
          ) {
            span.innerHTML = "Invalid email";
            status = false;
          } else {
            span.innerHTML = "";
          }
        }
      }

      if (key == "PhoneNumber") {
        if (formData.get("PhoneNumber")) {
          if (!RegExp(/^[0-9]{10}$/).test(formData.get("PhoneNumber"))) {
            span.innerHTML = "Invalid phone number";
            status = false;
          } else {
            span.innerHTML = "";
          }
        }
      }

      if (key == "Password" && (value.length < 8 || value.length > 64)) {
        status = false;
        span.innerHTML = "Password must be between 8 and 64 characters";
      }
    }

    if (status == true) {
      return formData;
    } else {
      return;
    }
  }
}

function captureLoginData() {
  var form = document.getElementById("loginForm");
  if (form) {
    var formData = new FormData(form);

    var emailOrUsername = document.getElementById("EmailOrUsernameInput").value;
    var password = document.getElementById("PasswordInput").value;

    var status = true;

    var formData = new FormData();

    formData.append("EmailOrUsername", emailOrUsername);
    formData.append("Password", password);

    for (const [key, value] of formData) {
      var span = document.getElementById(key + "InputSpan");
      if (value == "") {
        status = false;
        span.innerHTML = "This field is required";
      } else {
        span.innerHTML = "";
      }

      if (key == "Password" && (value.length < 8 || value.length > 64)) {
        status = false;
        span.innerHTML = "Password must be between 8 and 64 characters";
      }
    }

    if (status == true) {
      return formData;
    } else {
      return;
    }
  }
}

function captureResetPasswordData() {
  var password = document.getElementById("PasswordInput").value;
  var confirmedPassword = document.getElementById("ConfirmPasswordInput").value;

  var status = true;

  if (confirmedPassword != "" && password != "") {
    if (confirmedPassword != password) {
      var span = document.getElementById("ConfirmPasswordInputSpan");
      span.innerHTML = "Password does not match";
      status = false;
    } else {
      var span = document.getElementById("ConfirmPasswordInputSpan");
      span.innerHTML = "";
    }
  } else {
    if (password == "") {
      var span = document.getElementById("PasswordInputSpan");
      span.innerHTML = "This field is required";
      status = false;
    } else {
      var span = document.getElementById("PasswordInputSpan");
      span.innerHTML = "";
    }
    if (confirmedPassword == "") {
      var span = document.getElementById("ConfirmPasswordInputSpan");
      span.innerHTML = "This field is required";
      status = false;
    } else {
      var span = document.getElementById("ConfirmPasswordInputSpan");
      span.innerHTML = "";
    }

    if (password.length < 8 || password.length > 64) {
      var span = document.getElementById("PasswordInputSpan");
      span.innerHTML = "Password must be between 8 and 64 characters";
      status = false;
    } else {
      var span = document.getElementById("PasswordInputSpan");
      span.innerHTML = "";
    }
  }

  if (!status) {
    return;
  } else {
    return password;
  }
}
//#endregion

function showSpinner() {
  var preloaderActive = document.getElementById("preloader-active");
  preloaderActive.style.display = "block";
}

function hideSpinner() {
  var preloaderActive = document.getElementById("preloader-active");
  preloaderActive.style.display = "none";
}

function addError(data) {
  var allSpan = document.querySelectorAll("span");
  allSpan.forEach((span) => {
    span.innerHTML = "";
  });

  var allInput = document.getElementsByClassName("form-input");

  for (var i = 0; i < allInput.length; i++) {
    allInput[i].style.border = "1px solid #e5e5e5";
  }

  for (const [key, value] of Object.entries(data)) {
    var span = document.getElementById(key + "InputSpan");
    if (value != null) {
      span.innerHTML = "";

      for (const [key2, value2] of Object.entries(value)) {
        span.innerHTML += value2 + "<br>";
      }
    }
  }
}

async function login() {
  var data = captureLoginData();
  if (data) {
    showSpinner();

    var url = "https://localhost:7162/api/auth/login";

    var res = await fetchToBack(url, "POST", data);

    if (res.success == true) {
      document.getElementById("loginForm").reset();
      await sessionStorage.setItem("token", JSON.stringify(res.payload));

      hideSpinner();
      window.location.href = "./index.html";

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: data.message,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      hideSpinner();
      if (res.errors != null) {
        addError(res.errors);
      }
    }
  }
}

async function register() {
  var data = captureRegisterData();
  if (data) {
    showSpinner();

    var url = "https://localhost:7162/api/auth/register";
    var res = await fetchToBack(url, "POST", data);
    if (res.errors == null && res.success == true) {
      document.getElementById("registerForm").reset();
      hideSpinner();
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: data.message,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      hideSpinner();
      addError(res.errors);
    }
  }
}

async function forgotPassword() {
  var email = document.getElementById("EmailInput").value;
  var span = document.getElementById("EmailInputSpan");

  var status = true;
  if (email == "") {
    status = false;
    span.innerHTML = "This field is required";
  } else {
    span.innerHTML = "";
    if (!RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).test(email)) {
      span.innerHTML = "Invalid email";
      status = false;
    } else {
      span.innerHTML = "";
    }
  }

  if (!status) {
    return;
  }

  var url = `https://localhost:7162/api/auth/ForgotPassword?email=${email}`;
  var res = await fetchToBack(url, "GET", null);
  if (res.errors == null && res.success == true) {
    document.getElementById("forgotPasswordForm").reset();
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: res.message,
      timer: 2000,
      showConfirmButton: false,
    });
  } else {
    addError(res.errors);
  }
}

async function resetPassword() {
  var urlParams = new URLSearchParams(window.location.search);

  debugger;
  var token = urlParams.get("token");
  var userId = urlParams.get("userId");

  if (token == null || userId == null) {
    window.location.href = "./login.html";
  }

  var formData = new FormData();

  formData.append("resetToken", token);
  formData.append("userId", userId);

  var verifyUrl = `https://localhost:7162/api/Auth/VerifyResetToken`;

  var res = await fetchToBack(verifyUrl, "POST", formData);

  if (res.success == true) {
    var password = captureResetPasswordData();
    if (password) {
      var resetUrl = `https://localhost:7162/api/auth/resetPassword`;
      formData.append("NewPassword", password);
      var res = await fetchToBack(resetUrl, "POST", formData);
      if (res.success == true) {
        document.getElementById("resetPasswordForm").reset();
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: res.message,
          timer: 2000,
          showConfirmButton: false,
        });
        window.location.href = "./login.html";
      } else {
        addError(res.errors);
      }
    }
  } else {
    Swal.fire({
      position: "top-end",
      icon: "warning",
      title: res.message,
      timer: 2000,
      showConfirmButton: false,
    });
  }
}

if (document.getElementById("registerForm")) {
  document
    .getElementById("registerForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      register();
    });
}

if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    login();
  });
}

if (document.getElementById("forgotPasswordForm")) {
  document
    .getElementById("forgotPasswordForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      await forgotPassword();
    });
}

if (document.getElementById("resetPasswordForm")) {
  document
    .getElementById("resetPasswordForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      await resetPassword();
    });
}
