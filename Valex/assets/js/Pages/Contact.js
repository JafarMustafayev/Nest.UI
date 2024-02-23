// Datalar ilk yüklendiğinde çalışacak olan kodlar burada bulunacak

async function GetAll() {
  var table = document.getElementById("contactTable");
  var contactDetails = document.getElementById("contact-Box");

  if (!table) {
    return;
  }
  contactDetails.innerHTML = "";

  var url = "https://localhost:7162/api/admin/ContactManage/GetAll";

  table.innerHTML = `
  <div class="d-flex justify-content-center mt-5 mb-5" bis_skin_checked="1">
    <div class="spinner-grow" role="status" bis_skin_checked="1">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>`;

  await fetch(url, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data && !data.success) {
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
        table.innerHTML = "";

        var startWith = "";

        data.payload.forEach((element) => {
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
            </a>`;
          table.innerHTML += divCard;
        });
      }
    })
    .catch((err) => {
      table.innerHTML = "";
      Swal.fire({
        position: "top-end",
        icon: "warning",
        title: "Bir hata oluştu",
        showConfirmButton: false,
      });
    });
  contactDetails = searchContactItem();
}

// Contact details sayfası için aşağıdaki kodlar kullanılabilir.

function searchContactItem() {
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
            var contactDetails = document.getElementById("contact-Box");
            contactDetails.innerHTML = "";

            var tarihVeSaat = new Date(`${data.payload.createdAt}`);
            var formatli =
              tarihVeSaat.toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
              }) +
              " " +
              tarihVeSaat.toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              });
            var contactDetailsDiv = `
            <div class="main-content-body main-content-body-contacts card custom-card">
              <div class="main-contact-info-header pt-3">
                <div class="media">
                    <div class="media-body">
                      <h5>${data.payload.fullName}</h5>
                      <p>${formatli}</p>
                      <nav class="contact-info d-block d-lg-none d-xl-block">
                          <a href="javascript:void(0);" class="contact-icon border text-inverse mb-1" data-bs-toggle="tooltip" title="message"><i class="fe fe-message-square"></i></a>
                      </nav>
                    </div>
                    <div class="main-contact-action btn-list ms-auto pt-lg-0 float-end">
                      <a href="javascript:void(0);" class="btn ripple btn-secondary btn-icon" data-bs-placement="top" data-bs-toggle="tooltip" title="Delete Contact"><i class="fe fe-trash-2"></i></a>
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
          }
        })
        .catch((err) => {
          Swal.fire({
            position: "top-end",
            icon: "warning",
            title: "Bir hata oluştu",
            showConfirmButton: false,
          });
        });
    });
  });
}

window.onload = GetAll();

document.getElementById("refresh").addEventListener("click", function () {
  GetAll();
});
