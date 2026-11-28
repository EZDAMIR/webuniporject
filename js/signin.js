"use strict";

// jQuery 3.7.1: ready waits for the form fields and shared Store helpers.
$(function () {
  const $form = $("#signin-form");
  const $email = $("#signin-email").attr("autocomplete", "email");
  const $password = $("#signin-password").attr("autocomplete", "current-password");
  const $result = $("#signin-result");
  $("#signin-submit").text("Continue");

  function getRules() {
    return [
      {
        field: $email,
        error: Store.validEmail($email.val())
          ? ""
          : "Enter a valid email address, such as name@example.com.",
      },
      { field: $password, error: $password.val().trim() ? "" : "Enter your password." },
    ];
  }
  const validate = Store.bindValidation($form, getRules, $result);
  $form.on("submit", function (event) {
    // Without preventDefault, GET would put the password in the URL and reload the page.
    event.preventDefault();
    if (!validate()) return;
    $password.val("").attr("type", "password");
    Store.showMessage($result, "success", "Your details have been checked.");
  });
});
