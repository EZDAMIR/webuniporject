"use strict";

// jQuery 3.7.1: wait for the form before binding its handlers.
$(function () {
  const $form = $("#signup-form");
  const $name = $("#signup-name").attr("autocomplete", "name");
  const $email = $("#signup-email").attr("autocomplete", "email");
  const $phone = $("#signup-phone").attr("autocomplete", "tel");
  const $password = $("#signup-password").attr("autocomplete", "new-password");
  const $confirm = $("#signup-confirm").attr("autocomplete", "new-password");
  const $result = $("#signup-result");
  $form.before(Store.makeElement("p", "alert alert-info", "Telephone is optional."));
  $("#signup-submit").text("Continue");
  const $help = Store.makeElement(
    "p",
    "form-text",
    "Use at least 8 characters, excluding leading or trailing spaces.",
  ).attr("id", "signup-password-help");
  $password.before($help).attr("aria-describedby", $help.attr("id"));

  function getRules() {
    return [
      {
        field: $name,
        error: $name.val().trim().length >= 2 ? "" : "Enter a name with at least 2 characters.",
      },
      {
        field: $email,
        error: Store.validEmail($email.val())
          ? ""
          : "Enter a valid email address, such as name@example.com.",
      },
      {
        field: $phone,
        error:
          !$phone.val().trim() || Store.validPhone($phone.val().trim())
            ? ""
            : "Enter 10–15 digits with an optional leading +, spaces, brackets or hyphens.",
      },
      {
        field: $password,
        error:
          $password.val().trim().length >= 8
            ? ""
            : "Use at least 8 characters, excluding leading or trailing spaces.",
      },
      {
        field: $confirm,
        error:
          $confirm.val().trim() !== "" && $confirm.val().trim() === $password.val().trim()
            ? ""
            : "Repeat the password exactly.",
      },
    ];
  }
  const validate = Store.bindValidation($form, getRules, $result);
  $form.on("submit", function (event) {
    // Prevent GET from reloading the page and adding the contact details to the URL.
    event.preventDefault();
    if (!validate()) return;
    $form.trigger("reset");
    Store.showMessage($result, "success", "Your details have been checked.");
  });
});
