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
          console.log(data);
        }
        Swal.fire({
          position: "top-end",
          icon: "warning",
          title: data.message,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        return data;
      }
    })
    .catch((err) => {
      Swal.fire({
        position: "top-end",
        icon: "warning",
        title: "something went wrong",
        timer: 2000,
        showConfirmButton: false,
      });
    });
}

function Guid() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

async function imageToUrl(attachments) {
  return new Promise((resolve) => {
    var imageUrl = [];

    async function loadImage(index) {
      if (index < attachments.length) {
        const file = attachments[index];
        const reader = await new FileReader();

        reader.addEventListener("load", async () => {
          imageUrl.unshift(await reader.result);
          loadImage(index + 1);
        });

        await reader.readAsDataURL(file);
      } else {
        resolve(imageUrl);
      }
    }

    loadImage(0);
  });
}

async function captureData(toLocal) {
  var email = document.getElementById("toInput").value;
  var subject = document.getElementById("subjectInput").value;
  var message = document.getElementById("bodyInput").value;
  debugger;
  var attachments = document.getElementById("attachmentsInput").files;

  var formData = new FormData();
  formData.append("to", email);
  formData.append("subject", subject);
  formData.append("body", message);

  debugger;
  var status = true;
  for (const [key, value] of formData) {
    var element = document.getElementById(key + "Input");
    var span = document.getElementById(key + "InputSpan");
    if (value == "" && key != "attachments" && key != "body" && value == "") {
      element.style.border = "1px solid #cb4545";
      status = false;
      span.innerHTML = "This field is required";
    } else {
      element.style.border = "1px solid #2f3540";
      span.innerHTML = "";
    }

    if (key == "to") {
      if (formData.get("to")) {
        if (
          !RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).test(formData.get("to"))
        ) {
          element.style.border = "1px solid #cb4545";
          span.innerHTML = "Invalid email";
          status = false;
        } else {
          element.style.border = "1px solid #2f3540";
          span.innerHTML = "";
        }
      }
    }
  }

  if (!toLocal) {
    formData.append("attachments", attachments);
  }

  if (status == true) {
    return await formData;
  } else {
    return null;
  }
}

async function LoadContact() {
  var storage = localStorage.getItem("contactId");
  if (!storage) {
    return;
  }

  var data = await fetchToBack(
    `https://localhost:7162/api/admin/ContactManage/Get/${storage}`,
    "GET",
    null
  );
  data = data.payload;
  if (!data) {
    return;
  }

  var emailInput = document.getElementById("toInput");
  emailInput.value = data.email;
  emailInput.disabled = true;

  var subjectInput = document.getElementById("subjectInput");
  subjectInput.value = data.subject;
  subjectInput.disabled = true;

  var messageBox = document.getElementById("contact-box");

  messageBox.innerHTML = "";
  var DateTime = new Date(`${data.createdAt}`);
  var format =
    DateTime.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }) +
    " " +
    DateTime.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  var contactDetailsDiv = `
            <div class="main-content-body main-content-body-contacts card custom-card">
              <div class="main-contact-info-header pt-3">
                <div class="media">
                    <div class="media-body">
                      <h5>${data.fullName}</h5>
                      <p>${format}</p>
                      
                    </div>
                    
                </div>
              </div>
              <div class="main-contact-info-body p-4">
                <div>
                  <h6>${data.subject}</h6>
                  <p>${data.message}</p>
                </div>
                <div class="media-list pb-0">
                  <div class="media">
                    <div class="media-body">
                      <div>
                        <label>Email</label> <span>${data.email}</span>
                      </div>
                      <div>
                        <label>Phone</label> <span>${data.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            `;
  messageBox.innerHTML += contactDetailsDiv;
  localStorage.removeItem("contactId");
}

async function SendEmail() {
  var res = await captureData(false);

  if (res == null) {
    return;
  }

  var url = "https://localhost:7162/api/admin/Email/SendEmail";
  var resFromBack = await fetchToBack(url, "POST", res);
  if (!resFromBack) {
    return;
  }

  Swal.fire({
    position: "top-end",
    icon: "success",
    title: "Email sent",
    timer: 2000,
    showConfirmButton: false,
  });
}

async function SaveEmail() {
  var res = await captureData(true);
  if (!res) {
    return;
  }

  var data = Object();

  var counter = 0;
  await res.forEach((value, key) => {
    data[key] = value;
  });

  localStorage.setItem(Guid(), JSON.stringify(data));

  // window.location.href = "Mail.html";
}

window.addEventListener("DOMContentLoaded", async function () {
  await LoadContact();
});

document.getElementById("sendBtn").addEventListener("click", async function () {
  await SendEmail();
});

document.getElementById("saveBtn").addEventListener("click", async function () {
  await SaveEmail();
});

document.getElementById("attachments").addEventListener("click", function () {
  document.getElementById("attachmentsInput").click();
});
