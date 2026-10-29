"use strict";

// jQuery 3.7.1: wait for the form before binding its handlers.
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
    // Keep validation on this page; a normal GET would reload it with the email in the URL.
    event.preventDefault();
    if (!validate()) return;
    $form.trigger("reset");
    Store.showMessage($result, "success", "Your details have been checked.");
  });
});
