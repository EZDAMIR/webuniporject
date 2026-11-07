"use strict";

// jQuery 3.7.1: wait for the form before binding its handlers.
$(function () {
  const $form = $("#signup-form");
  const $name = $("#signup-name").attr({ autocomplete: "name", maxlength: 80 });
  const $email = $("#signup-email").attr("autocomplete", "email");
  const $phone = $("#signup-phone").attr("autocomplete", "tel");
  const $password = $("#signup-password").attr("autocomplete", "new-password");
  const $confirm = $("#signup-confirm").attr("autocomplete", "new-password");
  const $result = $("#signup-result");
  let busy = false;
  $form.before(Store.makeElement("p", "alert alert-info", "Telephone is optional."));
  Store.setupAccountDemo("signup");
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
  $form.on("submit", async function (event) {
    // Prevent GET from reloading the page and adding the contact details to the URL.
    event.preventDefault();
    if (busy) return;
    if (!validate()) return;
    busy = true;
    $form.attr("aria-busy", "true").find("fieldset").prop("disabled", true);
    Store.showMessage($result, "info", "Creating your account…");
    try {
      const response = await Store.registerDemoAccount($name.val(), $email.val(), $password.val());
      if (response.success) $form.trigger("reset");
      else if (response.field === "email") Store.setFieldError($email, response.message);
      Store.showMessage($result, response.success ? "success" : "danger", response.message);
    } catch (error) {
      Store.showMessage($result, "danger", error.message);
    } finally {
      busy = false;
      $form.attr("aria-busy", "false").find("fieldset").prop("disabled", false);
    }
  });
});
