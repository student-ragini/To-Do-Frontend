// Backend URL on Render
const API_BASE_URL = "https://to-do-backend-31p8.onrender.com";

// Frontend pages base path (public/pages)
const PAGES_BASE = "/public/pages";

function LoadDashboard() {
  if ($.cookie("userid")) {
    $.ajax({
      method: "get",
      url: `${PAGES_BASE}/user_dashboard.html`,
      success: (response) => {
        $("section").html(response);
        $("#lblUser").html($.cookie("userid"));

        $.ajax({
          method: "get",
          url: `${API_BASE_URL}/appointments/${$.cookie("userid")}`,
          success: (appointments) => {
            $("#appointments").empty();

            appointments.map((appointment) => {
              $(`
                <div class="alert alert-success alert-dismissible">
                  <h2>${appointment.title}</h2>
                  <p>${appointment.description}</p>
                  <div class="bi bi-calendar">
                    ${appointment.date.slice(0, appointment.date.indexOf("T"))}
                  </div>
                  <div class="mt-3">
                    <button value="${appointment.appointment_id}" id="btnEdit"
                            class="bi bi-pen-fill btn btn-warning mx-2"></button>
                    <button value="${appointment.appointment_id}" id="btnDelete"
                            class="bi bi-trash btn btn-danger mx-2"></button>
                  </div>
                </div>
              `).appendTo("#appointments");
            });
          }
        });
      }
    });
  } else {
    LoadPage("home.html");
  }
}

function LoadPage(page_name) {
  $.ajax({
    method: "get",
    url: `${PAGES_BASE}/${page_name}`,
    success: (response) => {
      $("section").html(response);
    }
  });
}

$(function () {
  // Start with home page
  LoadPage("home.html");

  // New User from home
  $(document).on("click", "#btnNewUser", () => {
    LoadPage("new_user.html");
  });

  // Signin from home
  $(document).on("click", "#btnSignin", () => {
    LoadPage("user_login.html");
  });

  // Existing User link on register page
  $(document).on("click", "#btnExistingUser", () => {
    LoadPage("user_login.html");
  });

  // Register new user
  $(document).on("click", "#btnRegister", () => {
    const user = {
      user_id: $("#user_id").val(),
      user_name: $("#user_name").val(),
      password: $("#password").val(),
      mobile: $("#mobile").val()
    };

    $.ajax({
      method: "post",
      url: `${API_BASE_URL}/register-user`,
      data: user,
      success: () => {
        alert("User Registered");
        LoadPage("user_login.html");
      }
    });
  });

  // Login
  $(document).on("click", "#btnLogin", () => {
    const user_id = $("#user_id").val();

    $.ajax({
      method: "get",
      url: `${API_BASE_URL}/users/${user_id}`,
      success: (userDetails) => {
        if (userDetails) {
          if ($("#password").val() === userDetails.password) {
            $.cookie("userid", $("#user_id").val());
            LoadDashboard();
          } else {
            alert("Invalid Password");
          }
        } else {
          alert("User Not Found");
        }
      }
    });
  });

  // Signout
  $(document).on("click", "#btnSignout", () => {
    $.removeCookie("userid");
    LoadPage("home.html");
  });

  // New Appointment button on dashboard
  $(document).on("click", "#btnNewAppointment", () => {
    LoadPage("add_appointment.html");
  });

  // Cancel Add -> back to dashboard
  $(document).on("click", "#btnCancel", () => {
    LoadDashboard();
  });

  // Add Appointment
  $(document).on("click", "#btnAdd", () => {
    const appointment = {
      appointment_id: $("#appointment_id").val(),
      title: $("#title").val(),
      description: $("#description").val(),
      date: $("#date").val(),
      user_id: $.cookie("userid")
    };

    $.ajax({
      method: "post",
      url: `${API_BASE_URL}/add-appointment`,
      data: appointment,
      success: () => {
        alert("Appointment Added");
        LoadDashboard();
      }
    });
  });

  // Edit click
  $(document).on("click", "#btnEdit", (e) => {
    LoadPage("edit_appointment.html");

    $.ajax({
      method: "get",
      url: `${API_BASE_URL}/appointment/${e.target.value}`,
      success: (appointment) => {
        $("#appointment_id").val(appointment.appointment_id);
        $("#title").val(appointment.title);
        $("#description").val(appointment.description);
        $("#date").val(
          appointment.date.slice(0, appointment.date.indexOf("T"))
        );
        sessionStorage.setItem("appointment_id", appointment.appointment_id);
      }
    });
  });

  // Edit cancel -> dashboard
  $(document).on("click", "#btnEditCancel", () => {
    LoadDashboard();
  });

  // Save edited appointment
  $(document).on("click", "#btnSave", () => {
    const appointment = {
      appointment_id: $("#appointment_id").val(),
      title: $("#title").val(),
      description: $("#description").val(),
      date: $("#date").val(),
      user_id: $.cookie("userid")
    };

    $.ajax({
      method: "put",
      url: `${API_BASE_URL}/edit-appointment/${sessionStorage.getItem(
        "appointment_id"
      )}`,
      data: appointment,
      success: () => {
        alert("Appointment Updated Successfully.");
        LoadDashboard();
      }
    });
  });

  // Delete appointment
  $(document).on("click", "#btnDelete", (e) => {
    const choice = confirm("Are you sure? Want to Delete?");
    if (choice === true) {
      $.ajax({
        method: "delete",
        url: `${API_BASE_URL}/delete-appointment/${e.target.value}`,
        success: () => {
          alert("Appointment Deleted..");
          LoadDashboard();
        }
      });
    }
  });
});