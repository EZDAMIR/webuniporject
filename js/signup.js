"use strict";

(function () {
  const form = document.getElementById("signup-form");
  const name = document.getElementById("signup-name");
  const email = document.getElementById("signup-email");
  const phone = document.getElementById("signup-phone");
  const password = document.getElementById("signup-password");
  const confirm = document.getElementById("signup-confirm");
  const result = document.getElementById("signup-result");
  form.before(Store.makeElement("p", "alert alert-info", "Telephone is optional."));
  document.getElementById("signup-submit").textContent = "Continue";
  name.autocomplete = "name";
  email.autocomplete = "email";
  phone.autocomplete = "tel";
  password.autocomplete = "new-password";
  confirm.autocomplete = "new-password";
  const passwordHelp = Store.makeElement(
    "p",
    "form-text",
    "Use at least 8 characters, excluding leading or trailing spaces.",
  );
  passwordHelp.id = "signup-password-help";
  password.before(passwordHelp);
  password.setAttribute("aria-describedby", passwordHelp.id);

  // Build rules from current values; "" means the field is valid.
  function getRules() {
    return [
      {
        field: name,
        error: name.value.trim().length >= 2 ? "" : "Enter a name with at least 2 characters.",
      },
      {
        field: email,
        error: Store.validEmail(email.value)
          ? ""
          : "Enter a valid email address, such as name@example.com.",
      },
      {
        // A blank phone is allowed; a supplied number must pass validation.
        field: phone,
        error:
          !phone.value.trim() || Store.validPhone(phone.value.trim())
            ? ""
            : "Enter 10–15 digits, using only +, spaces, brackets or hyphens.",
      },
      {
        field: password,
        error:
          password.value.trim().length >= 8
            ? ""
            : "Use at least 8 characters, excluding leading or trailing spaces.",
      },
      {
        // Compare full password values, including any spaces.
        field: confirm,
        error:
          confirm.value !== "" && confirm.value === password.value
            ? ""
            : "Repeat the password exactly.",
      },
    ];
  }

  const validate = Store.bindValidation(form, getRules, result);
  form.addEventListener("submit", function (event) {
    // Check locally without submitting or reloading the page.
    event.preventDefault();
    if (!validate()) {
      return;
    }
    // Restore defaults after validation; this does not create an account.
    form.reset();
    Store.showMessage(result, "success", "Your details have been checked.");
  });
})();
