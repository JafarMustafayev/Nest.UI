var inbox = document.getElementById("mailInboxSection");
var mailDetails = document.getElementById("mailDetailsSection");
var mailCompose = document.getElementById("composeSection");
var draft = document.getElementById("draftsSection");
var trash = document.getElementById("trashSection");
var nextPage = document.getElementById("nextPage");
var previousPage = document.getElementById("previousPage");

//#region Get data
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
      } else {
        console.log(data);
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

function GetDataOnLocalStorage() {
  var localStorageData = {};

  for (var i = 0; i < sessionStorage.length; i++) {
    key = sessionStorage.key(i);
    value = sessionStorage.getItem(key);
    if (
      value.includes("subject") &&
      value.includes("to") &&
      value.includes("body")
    ) {
      localStorageData[sessionStorage.key(i)] = JSON.parse(
        sessionStorage.getItem(sessionStorage.key(i))
      );
    }
  }

  return localStorageData;
}
//#endregion Get data

//#region Helper Functions

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

  var attachments = document.getElementById("attachmentsInput").files;

  var formData = new FormData();
  formData.append("to", email);
  formData.append("subject", subject);
  formData.append("body", message);

  var status = true;
  for (const [key, value] of formData) {
    var element = document.getElementById(key + "Input");
    var span = document.getElementById(key + "InputSpan");
    if (value == "" && key != "attachments" && key != "body" && value == "") {
      status = false;
      span.innerHTML = "This field is required";
    } else {
      span.innerHTML = "";
    }

    if (key == "to") {
      if (formData.get("to")) {
        if (
          !RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).test(formData.get("to"))
        ) {
          span.innerHTML = "Invalid email";
          status = false;
        } else {
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

function ShowSpinner(table) {
  if (table == null) {
    return;
  }
  spinner = `
  <div id="spinner" class="d-flex justify-content-center mt-5 mb-5" bis_skin_checked="1">
    <div class="spinner-grow" role="status" bis_skin_checked="1">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>`;

  table.innerHTML += spinner;
}

function HideSpinner() {
  var spinner = document.getElementById("spinner");
  if (spinner) {
    spinner.remove();
  }
}

function DateFormatter(date) {
  var DateTime = new Date(date);
  return (format =
    DateTime.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }) +
    " " +
    DateTime.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    }));
}

//#endregion Helper Functions

//#region Show Sections
async function OnLoad() {
  mailCompose.style.display = "none";
  mailDetails.style.display = "none";
  trash.style.display = "none";
  draft.style.display = "none";

  inbox.style.display = "block";

  var table = document.getElementById("inboxTable");
  table.innerHTML = "";
  ShowSpinner(table);
  var page = 1;
  sessionStorage.setItem("mailPage", page);
  var url = `https://localhost:7162/api/admin/Email/GetAllMails/${page}`;

  var data = await fetchToBack(url, "GET", null);
  if (!data) {
    return;
  }
  HideSpinner();
  AddDataToInbox(data.payload, table);
}

function ShowMailCompose() {
  mailDetails.style.display = "none";
  inbox.style.display = "none";
  draft.style.display = "none";
  trash.style.display = "none";

  if (!sessionStorage.getItem("contactId")) {
    document.getElementById("contact-box").innerHTML = "";
    document.getElementById("toInput").disabled = false;
    document.getElementById("toInput").value = "";
    document.getElementById("subjectInput").disabled = false;
    document.getElementById("subjectInput").value = "";
  }

  mailCompose.style.display = "block";
}

function ShowDrafts() {
  mailCompose.style.display = "none";
  mailDetails.style.display = "none";
  inbox.style.display = "none";
  trash.style.display = "none";

  draft.style.display = "block";

  var data = GetDataOnLocalStorage();
  AddDataToDraft(data);
}

function ShowMailDetails(data) {
  mailCompose.style.display = "none";
  inbox.style.display = "none";
  draft.style.display = "none";
  trash.style.display = "none";

  AddDataToDetails(data);

  mailDetails.style.display = "block";
}

async function ShowTrash() {
  mailCompose.style.display = "none";
  mailDetails.style.display = "none";
  inbox.style.display = "none";
  draft.style.display = "none";

  var table = document.getElementById("inboxTable");
  table.innerHTML = "";
  ShowSpinner(table);

  var url = `https://localhost:7162/api/admin/Email/RecycleBins`;

  var data = await fetchToBack(url, "GET", null);
  if (!data) {
    return;
  }
  HideSpinner();
  AddDataToInbox(data.payload, table);

  trash.style.display = "block";
}
//#endregion Show Sections

//#region Load and Add Data
function AddDataToDraft(data) {
  var table = document.getElementById("draftTable");
  table.innerHTML = "";
  var item;
  for (const key in data) {
    item = data[key];

    var row = `
      <div class="main-mail-item unread" id="draftItem" value="${key}">
        
        
        <div class="main-mail-body">
          <div class="main-mail-from">To:${item["to"]}</div>
          <div class="main-mail-subject"> <strong>Subject:${
            item["subject"]
          }</strong> </div>
          <span>Body:${
            item["body"]?.length > 50
              ? item["body"].substring(0, 65) + "..."
              : item["body"]
          }</span>
        </div>
      </div>`;
    table.innerHTML += row;
  }

  var draftItems = document.querySelectorAll("#draftItem");

  draftItems.forEach((element) => {
    var key = element.getAttribute("value");
    element.addEventListener("click", function () {
      var item = data[key];

      document.getElementById("discardBtn").value = key;

      document.getElementById("saveBtn").style.display = "none";
      ShowMailCompose();

      document.getElementById("toInput").value = item["to"];

      document.getElementById("subjectInput").value = item["subject"];

      document.getElementById("bodyInput").value = item["body"];
    });
  });
}

async function AddDataToInbox(data, table) {
  table.innerHTML = "";
  var item;
  for (const key in data) {
    item = data[key];

    var row = `
      <div  class="main-mail-item ${item["isSeen"] ? `` : `unread`}">
               
        <div id="inboxItem" value="${item["messageId"]}" class="main-mail-body">
          <div class="main-mail-from">To:${item["from"]}</div>
          <div class="main-mail-subject"> <strong>Subject:${
            item["subject"]
          }</strong> </div>
          <span>Body:${
            item["body"]?.length > 50
              ? item["body"].substring(0, 65) + "..."
              : item["body"]
          }</span>
        </div>
        <div class="main-mail-date">${DateFormatter(item["date"])}</div>
      </div>`;
    table.innerHTML += row;
  }

  var inboxItems = document.querySelectorAll("#inboxItem");

  inboxItems.forEach((element) => {
    var key = element.getAttribute("value");
    element.addEventListener("click", async function () {
      var url = `https://localhost:7162/api/admin/Email/GetMailById/${key}`;
      var data = await fetchToBack(url, "GET", null);

      ShowMailDetails(data.payload);
    });
  });
}

async function LoadContact() {
  var storage = sessionStorage.getItem("contactId");
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

  var contactDetailsDiv = `
            <div class="main-content-body main-content-body-contacts card custom-card">
              <div class="main-contact-info-header pt-3">
                <div class="media">
                    <div class="media-body">
                      <h5>${data.fullName}</h5>
                      <p>${DateFormatter(data.createdAt)}</p>
                      
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
  sessionStorage.removeItem("contactId");
}

function AddDataToDetails(data) {
  if (data == null) {
    return;
  }

  var mailBody = document.getElementById("mailDetailsBody");
  mailBody.innerHTML = " ";

  const match = data["from"].match(/"([^"]+)" <([^>]+)>/);
  const name = match ? match[1] : "";
  const emailAddress = match ? match[2] : data["to"];

  var mailDetailsDiv = `
  <div class="card-body">
    <div class="email-media">
        <div class="mt-0 d-sm-flex">
            <img class="me-2 rounded-circle avatar avatar-xl"
                src="../assets/images/faces/6.jpg" alt="avatar" />
            <div class="media-body">
                <div class="float-end d-none d-md-flex">
                    <span class="me-3">${DateFormatter(data["date"])}</span>
                    <small onclick="DeleteMail()" type="button" id="deleteEmail" value="${
                      data["messageId"]
                    }" class="me-3"><i class="bx bx-trash fs-18" data-bs-toggle="tooltip" title=""
                     data-bs-original-title="Delete"></i></small>
                    
                </div>
                <div class="media-title fw-bold mt-3">
                    ${name} <span class="text-muted">( ${emailAddress} )</span>
                    
                </div>
                <p class="mb-0">
                    to ${data["to"]}
                </p>
                <small class="me-2 d-md-none">${DateFormatter(
                  data["date"]
                )}</small>
                
            </div>
        </div>
    </div>
    <div class="email-body mt-5">
        <h6>${data["subject"]}</h6>
        <p>
            ${data["body"]}
        </p>
        
        <div class="email-attch">
            <div class="float-end">
                <a href="javascript:void(0);"><i class="bx bxs-download fs-18"
                        data-bs-toggle="tooltip" title=""></i></a>
            </div>
            
            <div class="emai-img">
                <div class="d-sm-flex">
                    <div class="m-2">
                        <a href="javascript:void(0);"><img class="wd-150 mb-2 rounded-3"
                                src="../assets/images/media/media-71.jpg"
                                alt="placeholder image" /></a>
                        <h6 class="mb-3 mb-lg-0 fs-14">
                            1.jpg
                            <small class="text-muted fw-normal">12kb</small>
                        </h6>
                    </div>
                    
                </div>
            </div>
        </div>
    </div>
  </div>`;
  mailBody.innerHTML += mailDetailsDiv;
}

async function NextMailPage() {
  previousPage.disabled = true;
  nextPage.disabled = true;
  var table = document.getElementById("inboxTable");
  table.innerHTML = "";
  ShowSpinner(table);

  var page = sessionStorage.getItem("mailPage");
  page++;

  sessionStorage.setItem("mailPage", page);
  var url = `https://localhost:7162/api/admin/Email/GetAllMails/${page}`;

  var data = await fetchToBack(url, "GET", null);
  if (!data) {
    return;
  }
  previousPage.disabled = false;
  nextPage.disabled = false;
  AddDataToInbox(data.payload, table);
}

async function PreviousMailPage() {
  previousPage.disabled = true;
  nextPage.disabled = true;
  var page = sessionStorage.getItem("mailPage");
  if (page <= 1) {
    return;
  }

  var table = document.getElementById("inboxTable");
  table.innerHTML = "";
  ShowSpinner(table);

  page--;
  sessionStorage.setItem("mailPage", page);

  var url = `https://localhost:7162/api/admin/Email/GetAllMails/${page}`;
  var data = await fetchToBack(url, "GET", null);
  if (!data) {
    return;
  }

  if (page < 2) {
    previousPage.disabled = true;
  } else {
    previousPage.disabled = false;
  }

  nextPage.disabled = false;
  AddDataToInbox(data.payload, table);
}
//#endregion Load and Add Data

//#region Send and Save Email
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

  document.getElementById("mailComposeForm").reset();
  OnLoad();

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

  sessionStorage.setItem(Guid(), JSON.stringify(data));
  document.getElementById("mailComposeForm").reset();
  OnLoad();
}

async function DeleteMail() {
  var messageId = document.getElementById("deleteEmail").getAttribute("value");
  var url = `https://localhost:7162/api/admin/Email/Delete/${messageId}`;
  var data = await fetchToBack(url, "DELETE", null);
  if (!data) {
    return;
  }

  OnLoad();
  Swal.fire({
    position: "top-end",
    icon: "success",
    title: data.message,
    timer: 2000,
    showConfirmButton: false,
  });
}
//#endregion Send and Save Email

//#region Delete and Discard Email

function DiscardEmail() {
  document.getElementById("mailComposeForm").reset();
  sessionStorage.removeItem(document.getElementById("discardBtn").value);
  OnLoad();
}

//#endregion Delete and Discard Email

//#region Add Event Listeners

document.addEventListener("DOMContentLoaded", async () => {
  var local = sessionStorage.getItem("contactId");
  if (local) {
    ShowMailCompose();
    await LoadContact();
  } else {
    OnLoad();
  }
});

document.getElementById("composeBtn").addEventListener("click", () => {
  ShowMailCompose();
});

document.getElementById("mailTableBtn").addEventListener("click", () => {
  OnLoad();
});

document.getElementById("draftTableBtn").addEventListener("click", () => {
  ShowDrafts();
});

document.getElementById("trashTableBtn").addEventListener("click", async () => {
  await ShowTrash();
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

document.getElementById("discardBtn").addEventListener("click", function () {
  DiscardEmail();
});

//#endregion Add Event Listeners
