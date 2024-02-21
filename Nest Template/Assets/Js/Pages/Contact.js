console.clear();
var url = "https://localhost:7162/api/Contact/PostContact";
var contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
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
          if (!RegExp(/^\d{10}$/).test(formData.get("Phone"))) {
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
      return;
    }
    var submitBtn = document.getElementById("Submit");
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sending...";

    console.clear();
    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status == "true" || data.status != 400) {
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
        } else {
          console.log(data.errors);

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
      })
      .catch((error) => {
        window.location.replace("./Page-404.html");
      });
  });
}
