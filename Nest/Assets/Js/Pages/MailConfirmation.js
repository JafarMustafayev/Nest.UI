window.onload = async function () {
  showSpinner();

  const urlParams = new URLSearchParams(window.location.search);

  const token = urlParams.get("token");
  const email = urlParams.get("email");

  var data = new FormData();
  data.append("Token", token);
  data.append("Email", email);

  var res = await fetchToBack(
    "https://localhost:7162/api/Auth/ConfirmEmail",
    "POST",
    data
  );

  hideSpinner();

  if (!res.success) {
    var div = document.getElementById("contentDiv");
    div.innerHTML = " ";
    div.innerHTML = "<h1>" + res.message + "</h1>";
  }
};

async function fetchToBack(url, method, data) {
  return await fetch(url, {
    method: method,
    body: data,
    headers: {
      accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
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

function showSpinner() {
  var preloaderActive = document.getElementById("preloader-active");
  preloaderActive.style.display = "block";
}

function hideSpinner() {
  var preloaderActive = document.getElementById("preloader-active");
  preloaderActive.style.display = "none";
}
