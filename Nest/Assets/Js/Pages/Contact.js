var url = "https://localhost:7162/api/Contact/PostContact";
var contactForm = document.getElementById("contact-form");
var submitBtn = document.getElementById("Submit");

function captureContactData() {
  var formData = new FormData();

  var name = document.getElementById("FullName");
  var email = document.getElementById("Email");
  var message = document.getElementById("Message");
  var phone = document.getElementById("Phone");
  var subject = document.getElementById("Subject");

  formData.append("FullName", name.value);
  formData.append("Email", email.value);
  formData.append("Phone", phone.value);
  formData.append("Subject", subject.value);
  formData.append("Message", message.value);

  var status = true;
  for (const [key, value] of formData) {
    var element = document.getElementById(key);
    var span = document.getElementById(key + "Span");
    if (value == "" && key != "Phone") {
      element.style.border = "1px solid red";
      span.innerHTML = "This field is required";
      status = false;
    } else {
      element.style.border = "1px solid #e5e5e5";
      span.innerHTML = "";
    }

    if (key == "Email") {
      if (formData.get("Email")) {
        if (
          !RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).test(
            formData.get("Email")
          )
        ) {
          element.style.border = "1px solid red";
          span.innerHTML = "Invalid email";
          status = false;
        } else {
          element.style.border = "1px solid #e5e5e5";
          span.innerHTML = "";
        }
      }
    }

    if (key == "Phone") {
      if (formData.get("Phone")) {
        if (
          !RegExp(
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
          ).test(formData.get("Phone"))
        ) {
          element.style.border = "1px solid red";
          span.innerHTML = "Invalid phone number";
          status = false;
        } else {
          element.style.border = "1px solid #e5e5e5";
          span.innerHTML = "";
        }
      }
    }
  }

  if (!status) {
    null;
  } else {
    return formData;
  }
}

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
      var spinner = document.getElementById("spinner");
      if (spinner) {
        spinner.remove();
      }
      Swal.fire({
        position: "top-end",
        icon: "warning",
        title: "something went wrong",
        timer: 2000,
        showConfirmButton: false,
      });
    });
}

function resetForm() {
  contactForm.reset();

  submitBtn.disabled = false;
  submitBtn.innerHTML = "Send message";
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

  for (const [key, value] of Object.entries(data.errors)) {
    var element = document.getElementById(key);
    var span = document.getElementById(key + "Span");
    if (value != null) {
      span.innerHTML = "";
      element.style.border = "1px solid red";

      for (const [key2, value2] of Object.entries(value)) {
        span.innerHTML += value2 + "<br>";
      }
    }
  }

  submitBtn.disabled = false;
  submitBtn.innerHTML = "Send message";
}

function addSuccess(data) {
  contactForm.reset();

  submitBtn.disabled = false;
  submitBtn.innerHTML = "Send message";

  Swal.fire({
    position: "top-end",
    icon: "success",
    title: data.message,
    showConfirmButton: false,
    timer: 1500,
  });
}

async function postContact() {
  var formData = captureContactData();

  if (!formData) {
    return;
  }
  submitBtn.disabled = true;
  submitBtn.innerHTML = "Sending...";

  var response = await fetchToBack(url, "POST", formData);

  if (response) {
    if (response.status == "true" || response.status != 400) {
      addSuccess(response);
    } else {
      addError(response);
    }
  }
}

contactForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  postContact();
});
