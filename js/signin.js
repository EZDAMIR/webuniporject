"use strict";

// jQuery 3.7.1: wait for the form before binding its handlers.
$(function () {
  const $form = $("#signin-form");
  const $email = $("#signin-email").attr("autocomplete", "email");
  const $password = $("#signin-password").attr("autocomplete", "current-password");
  const $result = $("#signin-result");
  let busy = false;
  Store.setupAccountDemo("signin");

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
  $form.on("submit", async function (event) {
    // Keep validation on this page; a normal GET would reload it with the email in the URL.
    event.preventDefault();
    if (busy) return;
    if (!validate()) return;
    busy = true;
    $form.attr("aria-busy", "true").find("fieldset").prop("disabled", true);
    Store.showMessage($result, "info", "Checking your credentials…");
    try {
      const response = await Store.signInDemoAccount($email.val(), $password.val());
      if (response.success) $form.trigger("reset");
      else $password.val("");
      Store.showMessage($result, response.success ? "success" : "danger", response.message);
    } catch (error) {
      Store.showMessage($result, "danger", error.message);
    } finally {
      busy = false;
      $form.attr("aria-busy", "false").find("fieldset").prop("disabled", false);
    }
  });
});
