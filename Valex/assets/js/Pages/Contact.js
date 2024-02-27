function ShowSpinner() {
  spinner = `
  <div id="spinner" class="d-flex justify-content-center mt-5 mb-5" bis_skin_checked="1">
    <div class="spinner-grow" role="status" bis_skin_checked="1">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>`;
  table = document.getElementById("contactTable");
  table.innerHTML += spinner;
}

function HideSpinner() {
  var spinner = document.getElementById("spinner");
  if (spinner) {
    spinner.remove();
  }
}

async function Get(page = 1) {
  console.log(page);
  var table = document.getElementById("contactTable");
  var url = `https://localhost:7162/api/admin/ContactManage/GetAll/${page}`;

  return await fetch(url, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data || !data.success) {
        table.innerHTML = "";
        if (!data.message) {
          data.message = "internal server error";
        }
        Swal.fire({
          position: "top-end",
          icon: "warning",
          title: data.message,
          showConfirmButton: false,
        });
      } else {
        return data.payload;
      }
    })
    .catch((err) => {
      table.innerHTML = "";
      Swal.fire({
        position: "top-end",
        icon: "warning",
        title: "something went wrong",
        showConfirmButton: false,
      });
    });
}

async function AddDataToTable(data) {
  var table = document.getElementById("contactTable");
  HideSpinner();

  var startWith = "";

  data.forEach((element) => {
    if (element.fullName[0].toUpperCase() != startWith.toUpperCase()) {
      startWith = element.fullName[0].toUpperCase();
      var startsWithDiv = `
            <div class="main-contact-label">${startWith}</div>
            `;
      table.innerHTML += startsWithDiv;
    }

    if (element.fullName && element.fullName.length > 40) {
      element.fullName = element.fullName.substring(0, 40) + "...";
    }

    var divCard = `
            <a id="main-item" value="${element.id}" class="main-contact-item">
          
            ${element.isRead ? "" : '<span class="pulse-danger"></span>'} 
              <div class="avatar avatar-md avatar-rounded bg-secondary">
                <span class="flex-shrink-0">
                  ${element.fullName[0].toUpperCase()}
                </span>
                </div>
              <div class="main-contact-body">
                <h6 class="fs-14">${element.fullName}</h6>
                <span>${element.subject}</span>
                <span class="main-contact-star display float-end">
                  ${element.createdAt.split("T")[0]}
                </span>
              </div>
            </a><span class=" float-end"></span>`;
    table.innerHTML += divCard;
  });
}

async function ContactDetails() {
  var items = document.querySelectorAll("#main-item");
  items.forEach((element) => {
    element.addEventListener("click", async function () {
      var id = element.getAttribute("value");
      var url = `https://localhost:7162/api/admin/ContactManage/Get/${id}`;

      await fetch(url, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data && !data.success) {
            if (!data.message) {
              data.message = "internal server error";
            }
            Swal.fire({
              position: "top-end",
              icon: "warning",
              title: data.message,
              showConfirmButton: false,
            });
          } else {
            element
              .getElementsByTagName("span")[0]
              .classList.remove("pulse-danger");

            var contactDetails = document.getElementById("contact-Box");
            contactDetails.innerHTML = "";

            var DateTime = new Date(`${data.payload.createdAt}`);
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
                      <h5>${data.payload.fullName}</h5>
                      <p>${format}</p>
                      <nav class="contact-info d-block d-lg-none d-xl-block">
                          <a href="javascript:void(0);" id="sendMessage" value="${data.payload.id}" class="contact-icon border text-inverse mb-1" data-bs-toggle="tooltip" title="message"><i class="fe fe-message-square"></i></a>
                      </nav>
                    </div>
                    <div class="main-contact-action btn-list ms-auto pt-lg-0 float-end">
                      <a href="javascript:void(0);" id="deleteContact" value="${data.payload.id}" class="btn ripple btn-secondary btn-icon" data-bs-placement="top" data-bs-toggle="tooltip" title="Delete Contact"><i class="fe fe-trash-2"></i></a>
                    </div>
                </div>
              </div>
              <div class="main-contact-info-body p-4">
                <div>
                  <h6>${data.payload.subject}</h6>
                  <p>${data.payload.message}</p>
                </div>
                <div class="media-list pb-0">
                  <div class="media">
                    <div class="media-body">
                      <div>
                        <label>Email</label> <span>${data.payload.email}</span>
                      </div>
                      <div>
                        <label>Phone</label> <span>${data.payload.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            `;

            contactDetails.innerHTML += contactDetailsDiv;
            DeleteContact();
            SendMessage();
          }
        })
        .catch((err) => {
          Swal.fire({
            position: "top-end",
            icon: "warning",
            title: "something went wrong",
            showConfirmButton: false,
          });
        });
    });
  });
}

async function DeleteContact() {
  var deleteButton = document.getElementById("deleteContact");
  deleteButton.addEventListener("click", async function () {
    var id = deleteButton.getAttribute("value");
    var url = `https://localhost:7162/api/admin/ContactManage/Delete/${id}`;

    await fetch(url, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data && !data.success) {
          if (!data.message) {
            data.message = "internal server error";
          }
          Swal.fire({
            position: "top-end",
            icon: "warning",
            title: data.message,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: data.message,
            showConfirmButton: false,
          });

          document.getElementById("contact-Box").innerHTML = "";

          document.querySelectorAll("#main-item").forEach((element) => {
            if (element.getAttribute("value") == id) {
              element.remove();
            }
          });
        }
      })
      .catch((err) => {
        Swal.fire({
          position: "top-end",
          icon: "warning",
          title: "something went wrong",
          showConfirmButton: false,
        });
      });
  });
}

function SendMessage() {
  sendButton = document.getElementById("sendMessage");
  sendButton.addEventListener("click", function () {
    var storage = localStorage.getItem("contactId");
    if (storage) {
      localStorage.removeItem("contactId");
    }
    localStorage.setItem("contactId", sendButton.getAttribute("value"));
    window.location.href = "../html/mail.html";
  });
}

async function LoadMore(table) {
  if (
    table.scrollTop + table.clientHeight == table.scrollHeight &&
    isLoadingMore
  ) {
    isLoadingMore = false;
    ShowSpinner();
    setTimeout(async function () {
      HideSpinner();
      localStorage.setItem("page", parseInt(localStorage.getItem("page")) + 1);
      var page = parseInt(localStorage.getItem("page"));
      var data = await Get(page);
      await AddDataToTable(data);
      ContactDetails();
      isLoadingMore = true;
    }, 3000);
    return;
  }
  return;
}

async function OnLoad() {
  localStorage.setItem("page", 1);
  var table = document.getElementById("contactTable");
  table.innerHTML = "";
  var chatBox = document.getElementById("contact-Box");
  chatBox.innerHTML = "";

  ShowSpinner();
  var data = await Get();
  await AddDataToTable(data);
  ContactDetails();
}

var isLoadingMore = true;
var table = document.getElementById("contactTable");

table.addEventListener("scroll", function () {
  LoadMore(table);
});

document.addEventListener("DOMContentLoaded", async function () {
  OnLoad();
});

var refresh = document.getElementById("refresh");
refresh.addEventListener("click", async function () {
  OnLoad();
});
