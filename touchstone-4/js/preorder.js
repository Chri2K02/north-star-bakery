// ==========================================================
// North Star Bakery - preorder.js (Products page)
// Lets customers build a pre-order list by clicking
// "Add to my list". The list updates on the page right away
// and is saved in localStorage so it is still there after a
// refresh and can be added to the order form on the Contact page.
// ==========================================================

// The customer's current list: an array of { id, quantity } objects
let preorderList = loadPreorderList();

// References to the elements this script updates
const listItemsElement = document.getElementById("list-items");
const listEmptyElement = document.getElementById("list-empty");
const listTotalElement = document.getElementById("list-total");
const listActionsElement = document.getElementById("list-actions");
const listStatusElement = document.getElementById("list-status");

// Finds an item already in the list, or returns undefined
function findListItem(productId) {
    return preorderList.find(function (item) {
        return item.id === productId;
    });
}

// Adds one of a product to the list (or increases its quantity)
function addToList(productId) {
    const product = findProduct(productId);
    const existingItem = findListItem(productId);

    if (existingItem) {
        if (existingItem.quantity >= MAX_QUANTITY) {
            showStatus("You can request up to " + MAX_QUANTITY + " of each item online. Please mention larger orders in the form.");
            return;
        }
        existingItem.quantity = existingItem.quantity + 1;
    } else {
        preorderList.push({ id: productId, quantity: 1 });
    }

    updateList();
    showStatus(product.name + " was added to your pre-order list.");
}

// Changes an item's quantity by +1 or -1 and removes it at zero
function changeQuantity(productId, change) {
    const item = findListItem(productId);
    if (!item) {
        return;
    }

    const newQuantity = item.quantity + change;
    if (newQuantity > MAX_QUANTITY) {
        showStatus("You can request up to " + MAX_QUANTITY + " of each item online.");
        return;
    }

    if (newQuantity <= 0) {
        removeFromList(productId);
        return;
    }

    item.quantity = newQuantity;
    updateList();
}

// Removes an item from the list completely
function removeFromList(productId) {
    const product = findProduct(productId);
    preorderList = preorderList.filter(function (item) {
        return item.id !== productId;
    });
    updateList();
    showStatus(product.name + " was removed from your list.");
}

// Empties the whole list
function clearList() {
    preorderList = [];
    updateList();
    showStatus("Your pre-order list has been cleared.");
}

// Adds up the estimated cost of every item in the list
function calculateTotal() {
    let total = 0;
    preorderList.forEach(function (item) {
        total = total + findProduct(item.id).price * item.quantity;
    });
    return total;
}

// Counts the total number of items (for example, 2 loaves + 3 buns = 5)
function countItems() {
    let count = 0;
    preorderList.forEach(function (item) {
        count = count + item.quantity;
    });
    return count;
}

// Builds one <li> in the list with quantity buttons and a remove button
function createListItemElement(item) {
    const product = findProduct(item.id);
    const listItem = document.createElement("li");
    listItem.className = "list-item";

    const details = document.createElement("span");
    details.className = "list-item-name";
    details.textContent = product.name + " (" + formatPrice(product.price) + " each)";

    const controls = document.createElement("span");
    controls.className = "quantity-controls";

    const minusButton = document.createElement("button");
    minusButton.type = "button";
    minusButton.className = "qty-btn";
    minusButton.textContent = "−";
    minusButton.setAttribute("aria-label", "Remove one " + product.name);
    minusButton.dataset.action = "decrease";
    minusButton.dataset.product = item.id;

    const quantity = document.createElement("span");
    quantity.className = "quantity";
    quantity.textContent = item.quantity;

    const plusButton = document.createElement("button");
    plusButton.type = "button";
    plusButton.className = "qty-btn";
    plusButton.textContent = "+";
    plusButton.setAttribute("aria-label", "Add one more " + product.name);
    plusButton.dataset.action = "increase";
    plusButton.dataset.product = item.id;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-btn";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", "Remove " + product.name + " from your list");
    removeButton.dataset.action = "remove";
    removeButton.dataset.product = item.id;

    controls.append(minusButton, quantity, plusButton, removeButton);
    listItem.append(details, controls);
    return listItem;
}

// Redraws the list section so it always matches preorderList
function renderList() {
    listItemsElement.innerHTML = "";

    if (preorderList.length === 0) {
        listEmptyElement.hidden = false;
        listTotalElement.textContent = "";
        listActionsElement.hidden = true;
        return;
    }

    listEmptyElement.hidden = true;
    listActionsElement.hidden = false;

    preorderList.forEach(function (item) {
        listItemsElement.appendChild(createListItemElement(item));
    });

    const itemCount = countItems();
    listTotalElement.textContent = itemCount + (itemCount === 1 ? " item" : " items") +
        " | Estimated total: " + formatPrice(calculateTotal());
}

// Changes each "Add to my list" button to show how many are in the list
function updateAddButtons() {
    document.querySelectorAll(".add-btn").forEach(function (button) {
        const item = findListItem(button.dataset.product);
        if (item) {
            button.textContent = "Add another (" + item.quantity + " in list)";
            button.classList.add("in-list");
        } else {
            button.textContent = "Add to my list";
            button.classList.remove("in-list");
        }
    });
}

// Saves the list and refreshes everything on the page that depends on it
function updateList() {
    savePreorderList(preorderList);
    renderList();
    updateAddButtons();
}

// Shows a short message that screen readers also announce
function showStatus(message) {
    listStatusElement.textContent = message;
}

// Handles clicks on the minus, plus, and remove buttons inside the list
function handleListClick(event) {
    const button = event.target.closest("button");
    if (!button) {
        return;
    }

    const productId = button.dataset.product;
    if (button.dataset.action === "increase") {
        changeQuantity(productId, 1);
    } else if (button.dataset.action === "decrease") {
        changeQuantity(productId, -1);
    } else if (button.dataset.action === "remove") {
        removeFromList(productId);
    }
}

// Connects the buttons to their functions and shows any saved list
function initPreorderList() {
    document.querySelectorAll(".add-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            addToList(button.dataset.product);
        });
    });

    listItemsElement.addEventListener("click", handleListClick);
    document.getElementById("list-clear").addEventListener("click", clearList);

    renderList();
    updateAddButtons();

    if (preorderList.length > 0) {
        showStatus("Welcome back! Your saved pre-order list is shown above.");
    }
}

initPreorderList();
