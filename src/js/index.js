document.addEventListener("DOMContentLoaded", function () {
  let rezultForm = document.querySelector(".rezult-form");
  let titlePopupCheck = document.querySelector(".rezult-form-container-title");

  if (rezultForm) {
    let rezultFormCloseBtnIcon = rezultForm.querySelector(
      ".rezult-form-close-btn-icon",
    );
    if (rezultFormCloseBtnIcon) {
      rezultFormCloseBtnIcon.addEventListener("click", function () {
        rezultForm.classList.remove("opened");
      });
    }

    rezultForm.addEventListener("click", function (e) {
      if (e.target.closest(".rezult-form-container")) {
        return;
      }
      rezultForm.classList.remove("opened");
    });
  }

  const POPUP_FORM_DEFAULTS = {
    title: "Оставить заявку",
    buttonText: "Отправить",
  };

  function getPopupFormElementById(popupId) {
    if (!popupId) return null;
    return document.getElementById(popupId);
  }

  function getPopupDynamicText(trigger, attrName, fallbackValue) {
    if (!trigger) return fallbackValue;
    const value = trigger.getAttribute(attrName);
    if (value === null) return fallbackValue;
    const trimmed = value.trim();
    return trimmed || fallbackValue;
  }

  function resetPopupFormState(popup) {
    const form = popup.querySelector("form[data-form]");
    if (!form) return;

    form.removeAttribute("data-submitted");
    form.querySelectorAll("[data-popup-info-input]").forEach((input) => {
      input.remove();
    });
    form.querySelectorAll("[data-error]").forEach((errorBlock) => {
      const customClass = errorBlock.getAttribute("data-error");
      const classToRemove =
        customClass && customClass.trim() ? customClass.trim() : "error";
      errorBlock.classList.remove(classToRemove);
    });
    form.querySelectorAll('button[type="submit"], input[type="submit"]').forEach((submitBtn) => {
      submitBtn.disabled = false;
    });
  }

  function applyPopupInfoHiddenInputs(popup, trigger) {
    const form = popup.querySelector("form[data-form]");
    if (!form || !trigger) return;

    Array.from(trigger.attributes).forEach((attr) => {
      if (!attr || !attr.name || !attr.name.startsWith("data-info-")) return;
      const inputName = attr.name.replace("data-info-", "");
      if (!inputName) return;

      const hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = inputName;
      hidden.value = attr.value || "";
      hidden.setAttribute("data-popup-info-input", "true");
      form.appendChild(hidden);
    });
  }

  function openPopupFormByTrigger(trigger) {
    const popupId = trigger.getAttribute("data-popup-open");
    const popup = getPopupFormElementById(popupId);
    if (!popup || !popup.classList.contains("popup-form")) return;

    const title = getPopupDynamicText(
      trigger,
      "data-popup-form-title",
      POPUP_FORM_DEFAULTS.title,
    );
    const buttonText = getPopupDynamicText(
      trigger,
      "data-popup-form-btn-text",
      POPUP_FORM_DEFAULTS.buttonText,
    );

    const titleNode = popup.querySelector(".popup-form-title");
    const submitBtn = popup.querySelector(".popup-form-submit");
    if (titleNode) titleNode.textContent = title;
    if (submitBtn) submitBtn.textContent = buttonText;

    resetPopupFormState(popup);
    applyPopupInfoHiddenInputs(popup, trigger);

    popup.classList.add("active");
    popup.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closePopupForm(popup) {
    if (!popup) return;
    popup.classList.remove("active");
    popup.setAttribute("aria-hidden", "true");

    if (!document.querySelector(".popup.active")) {
      document.body.classList.remove("no-scroll");
    }
  }

  document.addEventListener("click", function (event) {
    const openTrigger = event.target.closest("[data-popup-open]");
    if (openTrigger) {
      event.preventDefault();
      openPopupFormByTrigger(openTrigger);
      return;
    }

    const closeTrigger = event.target.closest("[data-popup-close]");
    if (!closeTrigger) return;
    const popup = closeTrigger.closest(".popup");
    closePopupForm(popup);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    const openedPopup = document.querySelector(".popup.active");
    if (openedPopup) closePopupForm(openedPopup);
  });

  const FORM_INPUT_MASKS = {
    phone: {
      nationalDigitsLength: 10,
      groupLengths: [3, 3, 2, 2],
      emptyChar: "_",
      emptyCharInParens: " ",
      format(nationalDigitsRaw) {
        const cfg = FORM_INPUT_MASKS.phone;
        let d = String(nationalDigitsRaw || "").replace(/\D/g, "");
        while (d.length > 0 && (d[0] === "7" || d[0] === "8")) d = d.slice(1);
        d = d.slice(0, cfg.nationalDigitsLength);

        const lens = cfg.groupLengths;
        const chunks = [];
        let offset = 0;
        for (let i = 0; i < lens.length; i += 1) {
          const len = lens[i];
          chunks.push(d.slice(offset, offset + len));
          offset += len;
        }

        const fill = (chunk, len, useParenChar) => {
          const empty = useParenChar ? cfg.emptyCharInParens : cfg.emptyChar;
          const pad = len - chunk.length;
          return chunk + (pad > 0 ? empty.repeat(pad) : "");
        };

        return `+7 (${fill(chunks[0] || "", lens[0], true)}) ${fill(chunks[1] || "", lens[1], false)}-${fill(chunks[2] || "", lens[2], false)}-${fill(chunks[3] || "", lens[3], false)}`;
      },
      parseToNationalDigits(displayValue) {
        let d = String(displayValue || "").replace(/\D/g, "");
        while (d.length > 0 && (d[0] === "7" || d[0] === "8")) d = d.slice(1);
        return d.slice(0, FORM_INPUT_MASKS.phone.nationalDigitsLength);
      },
    },
  };

  function isPhoneMaskedField(field) {
    return field.hasAttribute("data-phone") || field.getAttribute("data-mask") === "phone" || field.getAttribute("data-mask") === "";
  }

  function phoneNationalDigitsBeforeCursor(displayValue, cursorPos) {
    const slice = displayValue.slice(0, Math.max(0, cursorPos));
    let d = slice.replace(/\D/g, "");
    while (d.length > 0 && (d[0] === "7" || d[0] === "8")) d = d.slice(1);
    return Math.min(d.length, FORM_INPUT_MASKS.phone.nationalDigitsLength);
  }

  function phoneSetCursorAfterNationalDigits(input, formatted, nationalCount) {
    const openIdx = formatted.indexOf("(");
    if (openIdx < 0) return;
    if (nationalCount <= 0) {
      input.setSelectionRange(openIdx + 1, openIdx + 1);
      return;
    }
    let seen = 0;
    for (let i = openIdx + 1; i < formatted.length; i += 1) {
      if (/\d/.test(formatted[i])) {
        seen += 1;
        if (seen === nationalCount) {
          input.setSelectionRange(i + 1, i + 1);
          return;
        }
      }
    }
    input.setSelectionRange(formatted.length, formatted.length);
  }

  function applyPhoneMaskToInput(input) {
    const mask = FORM_INPUT_MASKS.phone;
    if (!mask) return;

    function applyFormattedFromRaw(rawVal, rawSel) {
      const newNat = mask.parseToNationalDigits(rawVal);
      const formatted = mask.format(newNat);
      let caretNat = phoneNationalDigitsBeforeCursor(rawVal, rawSel);
      caretNat = Math.max(0, Math.min(caretNat, newNat.length));
      input.value = formatted;
      phoneSetCursorAfterNationalDigits(input, formatted, caretNat);
    }

    input.addEventListener("focus", function () {
      if (!mask.parseToNationalDigits(input.value)) {
        input.value = mask.format("");
        phoneSetCursorAfterNationalDigits(input, input.value, 0);
      }
    });

    input.addEventListener("input", function () {
      const rawVal = input.value;
      const rawSel = input.selectionStart ?? 0;
      applyFormattedFromRaw(rawVal, rawSel);
    });
  }

  function showResult(message) {
    if (!rezultForm || !titlePopupCheck) return;
    titlePopupCheck.innerHTML = message;
    rezultForm.classList.add("opened");
    setTimeout(() => {
      rezultForm.classList.remove("opened");
    }, 3500);
  }

  function handleForms() {
    const forms = document.querySelectorAll("[data-form]");
    if (!forms.length) return;

    forms.forEach((form) => {
      if (form.classList.contains("form-checked")) return;
      form.classList.add("form-checked");

      form.querySelectorAll("[data-mask], [data-phone]").forEach((maskedInput) => {
        if (isPhoneMaskedField(maskedInput)) applyPhoneMaskToInput(maskedInput);
      });

      const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      const requiredFields = form.querySelectorAll("[data-required]");

      function getErrorConfig(field) {
        const errorTarget = field.closest("[data-error]");
        const errorClass =
          errorTarget && errorTarget.getAttribute("data-error")
            ? errorTarget.getAttribute("data-error").trim()
            : "error";
        return { errorTarget, classToAdd: errorClass || "error" };
      }

      function validateField(field) {
        if (field.hasAttribute("data-checkbox")) {
          const checkboxContainer = field.closest("[data-error]") || field.parentElement;
          const checkbox = checkboxContainer ? checkboxContainer.querySelector('input[type="checkbox"]') : null;
          return !!(checkbox && checkbox.checked);
        }

        if (isPhoneMaskedField(field)) {
          const rawValue = (field.value || "").trim();
          if (!rawValue || rawValue.indexOf("_") !== -1) return false;
          return FORM_INPUT_MASKS.phone.parseToNationalDigits(rawValue).length === 10;
        }

        return (field.value || "").trim().length > 0;
      }

      function renderFieldError(field, forceShow) {
        const config = getErrorConfig(field);
        if (!config.errorTarget) return validateField(field);
        const isValid = validateField(field);
        if (!forceShow || isValid) config.errorTarget.classList.remove(config.classToAdd);
        else config.errorTarget.classList.add(config.classToAdd);
        return isValid;
      }

      function validateForm(forceShow) {
        let hasErrors = false;
        requiredFields.forEach((field) => {
          if (!renderFieldError(field, forceShow)) hasErrors = true;
        });
        return !hasErrors;
      }

      requiredFields.forEach((field) => {
        const eventName = field.hasAttribute("data-checkbox") ? "change" : "input";
        field.addEventListener(eventName, function () {
          if (form.hasAttribute("data-submitted")) renderFieldError(field, true);
        });
      });

      function clearInputs() {
        form.querySelectorAll('input:not([type="hidden"])').forEach((input) => {
          if (input.type === "checkbox") input.checked = false;
          else input.value = "";
        });
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        form.setAttribute("data-submitted", "true");

        if (!validateForm(true)) return;

        showResult("Спасибо за заявку! <br>Скоро с вами свяжется наш консультант!");
        document.querySelectorAll(".popup.active").forEach((popup) => popup.classList.remove("active"));
        document.body.classList.remove("no-scroll");
        clearInputs();
        form.removeAttribute("data-submitted");
        submitButtons.forEach((btn) => {
          btn.disabled = false;
        });
      });
    });
  }

  window.initAjaxForms = function () {
    handleForms();
  };

  handleForms();
});
