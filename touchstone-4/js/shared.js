// ==========================================================
// North Star Bakery - shared.js
// Data and helper functions used by both the Products page
// (pre-order list) and the Contact page (form pre-fill).
// ==========================================================

// Product catalog: an array of objects. Each object describes
// one item a customer can add to their pre-order list.
const PRODUCTS = [
    { id: "signature-sourdough", name: "Signature Sourdough Loaf", category: "Breads", price: 10.00 },
    { id: "whole-wheat", name: "Whole Wheat Sandwich Bread", category: "Breads", price: 7.00 },
    { id: "rosemary-focaccia", name: "Rosemary Focaccia", category: "Breads", price: 9.00 },
    { id: "butter-croissant", name: "Butter Croissant", category: "Pastries", price: 4.00 },
    { id: "fruit-scone", name: "Seasonal Fruit Scone", category: "Pastries", price: 4.50 },
    { id: "cinnamon-bun", name: "Cinnamon Swirl Bun", category: "Pastries", price: 5.00 },
    { id: "celebration-cake", name: "Celebration Cake", category: "Cakes", price: 65.00 },
    { id: "event-cake", name: "Event and Office Sheet Cake", category: "Cakes", price: 90.00 },
    { id: "mini-cake", name: "Mini Cake", category: "Cakes", price: 8.00 }
];

// Names of the keys used in localStorage, kept in one object
// so the same key is never spelled two different ways.
const STORAGE_KEYS = {
    preorderList: "nsb-preorder-list",
    contactInfo: "nsb-contact-info"
};

// Largest quantity a customer can request for one item online
const MAX_QUANTITY = 24;

// Finds a product object in the catalog by its id
function findProduct(productId) {
    return PRODUCTS.find(function (product) {
        return product.id === productId;
    });
}

// Formats a number as a dollar amount, for example 12.5 -> "$12.50"
function formatPrice(amount) {
    return "$" + amount.toFixed(2);
}

// Reads a value from localStorage and turns it back into an
// array or object. Returns the fallback if nothing is saved
// or if the browser blocks storage.
function loadFromStorage(key, fallback) {
    try {
        const savedText = localStorage.getItem(key);
        return savedText ? JSON.parse(savedText) : fallback;
    } catch (error) {
        return fallback;
    }
}

// Saves an array or object to localStorage as text
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // Storage is unavailable (for example, private browsing).
        // The page still works; the list just won't be remembered.
    }
}

// Removes a saved value from localStorage
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        // Nothing to do if storage is unavailable
    }
}

// Loads the saved pre-order list: an array of { id, quantity } objects.
// Any item that no longer exists in the catalog is skipped.
function loadPreorderList() {
    const savedList = loadFromStorage(STORAGE_KEYS.preorderList, []);
    if (!Array.isArray(savedList)) {
        return [];
    }
    return savedList.filter(function (item) {
        return findProduct(item.id) && item.quantity > 0;
    });
}

// Saves the pre-order list, or removes it completely when it is empty
function savePreorderList(list) {
    if (list.length === 0) {
        removeFromStorage(STORAGE_KEYS.preorderList);
    } else {
        saveToStorage(STORAGE_KEYS.preorderList, list);
    }
}
