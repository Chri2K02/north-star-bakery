// ==========================================================
// North Star Bakery - contact.js (Contact page)
// 1. Validates the pre-order form with clear messages next to
//    each field and stops the form from sending if anything
//    is wrong.
// 2. Pre-fills the form from localStorage: the pre-order list
//    built on the Products page, plus the customer's name and
//    email from their last request.
// ==========================================================

const form = document.getElementById("preorder-form");
const formStatus = document.getElementById("form-status");
const prefillNote = document.getElementById("prefill-note");

// Custom cakes need at least 48 hours' notice (2 days)
const CUSTOM_CAKE_NOTICE_DAYS = 2;

// Simple email pattern: something@something.something
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ---------- Date helpers ----------

// Returns a date as "YYYY-MM-DD" in the visitor's own time zone.
// (toISOString() can't be used here because it converts to UTC,
// which is already "tomorrow" after 5 p.m. in Vancouver.)
function getDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

// Returns today's date plus a number of days, as "YYYY-MM-DD"
function getDateFromToday(daysToAdd) {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return getDateString(date);
}

// Makes the date picker start at today instead of a fixed date
function setMinimumPickupDate() {
    document.getElementById("pickup-date").min = getDateFromToday(0);
}

// ---------- Validation rules ----------

// Each rule is a function that returns an error message,
// or an empty string when the value is valid. The rules are
// stored in an object so each field id points to its own check.
const validationRules = {
    "name": function (value) {
        if (value === "") {
            return "Please enter your full name.";
        }
        if (value.length < 2) {
            return "Your name must be at least 2 characters long.";
        }
        if (value.length > 60) {
            return "Your name must be 60 characters or fewer.";
        }
        return "";
    },

    "email": function (value) {
        if (value === "") {
            return "Please enter your email address so we can confirm your order.";
        }
        if (!EMAIL_PATTERN.test(value)) {
            return "Please enter a valid email address, like name@example.com.";
        }
        return "";
    },

    "request-type": function (value) {
        if (value === "") {
            return "Please choose a request type.";
        }
        return "";
    },

    "pickup-date": function (value) {
        if (value === "") {
            return "Please choose a pickup date.";
        }
        if (value < getDateFromToday(0)) {
            return "The pickup date can't be in the past. Please choose today or a later date.";
        }
        const requestType = document.getElementById("request-type").value;
        const earliestCakeDate = getDateFromToday(CUSTOM_CAKE_NOTICE_DAYS);
        if (requestType === "custom-cake" && value < earliestCakeDate) {
            return "Custom cakes need at least 48 hours' notice. Please choose " + earliestCakeDate + " or later.";
        }
        return "";
    },

    "item-details": function (value) {
        if (value === "") {
            return "Please tell us which items you would like and how many.";
        }
        if (value.length < 5) {
            return "Please add a little more detail (at least 5 characters).";
        }
        if (value.length > 500) {
            return "Please keep item details to 500 characters or fewer.";
        }
        return "";
    },

    "allergy-notes": function (value) {
        if (value.length > 300) {
            return "Please keep allergy notes to 300 characters or fewer.";
        }
        return "";
    }
};

// ---------- Showing and clearing errors ----------

// Shows an error message right below a field and marks it invalid
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + "-error");
    errorElement.textContent = message;
    field.setAttribute("aria-invalid", "true");
    field.classList.add("field-invalid");
}

// Removes the error message from a field
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + "-error");
    errorElement.textContent = "";
    field.removeAttribute("aria-invalid");
    field.classList.remove("field-invalid");
}

// Checks one field against its rule. Returns true if it is valid.
function validateField(fieldId) {
    const value = document.getElementById(fieldId).value.trim();
    const message = validationRules[fieldId](value);

    if (message) {
        showFieldError(fieldId, message);
        return false;
    }
    clearFieldError(fieldId);
    return true;
}

// Checks every field and returns an array of the ids that failed
function validateForm() {
    const invalidFields = [];
    Object.keys(validationRules).forEach(function (fieldId) {
        if (!validateField(fieldId)) {
            invalidFields.push(fieldId);
        }
    });
    return invalidFields;
}

// ---------- Saving and pre-filling ----------

// Turns the saved pre-order list into text for the Item details box,
// for example "2 x Signature Sourdough Loaf"
function buildItemDetailsText(list) {
    const lines = list.map(function (item) {
        return item.quantity + " x " + findProduct(item.id).name;
    });
    return lines.join("\n");
}

// Fills in the form with anything saved in localStorage
function prefillFromStorage() {
    const notes = [];

    const savedContact = loadFromStorage(STORAGE_KEYS.contactInfo, null);
    if (savedContact && savedContact.name) {
        document.getElementById("name").value = savedContact.name;
        document.getElementById("email").value = savedContact.email || "";
        notes.push("Welcome back, " + savedContact.name + "! We filled in your name and email from your last request.");
    }

    const savedList = loadPreorderList();
    const itemDetails = document.getElementById("item-details");
    if (savedList.length > 0 && itemDetails.value.trim() === "") {
        itemDetails.value = buildItemDetailsText(savedList);
        document.getElementById("request-type").value = "pre-order";
        notes.push("We added the items from your pre-order list. You can edit them before sending.");
    }

    prefillNote.textContent = notes.join(" ");
    prefillNote.hidden = notes.length === 0;
}

// Remembers the customer's name and email for their next visit
function saveContactInfo() {
    saveToStorage(STORAGE_KEYS.contactInfo, {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim()
    });
}

// ---------- Form events ----------

// Runs when the customer clicks "Send Request"
function handleSubmit(event) {
    // This demo site has no server, so the form never really sends.
    event.preventDefault();
    formStatus.classList.remove("form-status-success");

    const invalidFields = validateForm();
    if (invalidFields.length > 0) {
        formStatus.textContent = "Please fix the " + invalidFields.length +
            (invalidFields.length === 1 ? " highlighted field" : " highlighted fields") + " above, then send your request again.";
        document.getElementById(invalidFields[0]).focus();
        return;
    }

    saveContactInfo();
    savePreorderList([]);
    const customerName = document.getElementById("name").value.trim();
    form.reset();
    prefillFromStorage();
    setMinimumPickupDate();
    formStatus.textContent = "Thank you, " + customerName + "! Your request has been sent. We will email you within one business day.";
    formStatus.classList.add("form-status-success");
}

// Re-checks a field when the customer leaves it, and clears
// the error as soon as they fix it while typing
function addLiveValidation() {
    Object.keys(validationRules).forEach(function (fieldId) {
        const field = document.getElementById(fieldId);

        field.addEventListener("blur", function () {
            if (field.value.trim() !== "" || field.hasAttribute("aria-invalid")) {
                validateField(fieldId);
            }
        });

        field.addEventListener("input", function () {
            if (field.hasAttribute("aria-invalid")) {
                validateField(fieldId);
            }
        });
    });

    // Changing the request type can change which pickup dates are allowed
    document.getElementById("request-type").addEventListener("change", function () {
        if (document.getElementById("pickup-date").value !== "") {
            validateField("pickup-date");
        }
    });
}

// Sets everything up when the page loads
function initContactForm() {
    form.noValidate = true; // use the JavaScript messages instead of the browser's pop-ups
    setMinimumPickupDate();
    prefillFromStorage();
    addLiveValidation();
    form.addEventListener("submit", handleSubmit);
}

initContactForm();
