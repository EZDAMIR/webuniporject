"use strict";

(function () {
  const form = document.getElementById("signin-form");
  const email = document.getElementById("signin-email");
  const password = document.getElementById("signin-password");
  const result = document.getElementById("signin-result");
  document.getElementById("signin-submit").textContent = "Continue";
  email.autocomplete = "email";
  password.autocomplete = "current-password";

  function getRules() {
    return [
      {
        field: email,
        error: Store.validEmail(email.value)
          ? ""
          : "Enter a valid email address, such as name@example.com.",
      },
      {
        field: password,
        error: password.value.trim() ? "" : "Enter your password.",
      },
    ];
  }

  const validate = Store.bindValidation(form, getRules, result);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    password.value = "";
    password.type = "password";
    Store.showMessage(result, "success", "Your details have been checked.");
  });
})();
