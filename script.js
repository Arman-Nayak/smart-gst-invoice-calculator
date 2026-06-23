const form = document.getElementById("invoiceForm");

const productNameInput = document.getElementById("productName");
const priceInput = document.getElementById("price");
const quantityInput = document.getElementById("quantity");
const gstRateInput = document.getElementById("gstRate");

const presetButtons = document.querySelectorAll(".preset-btn");

const subtotalValue = document.getElementById("subtotalValue");
const gstValue = document.getElementById("gstValue");
const totalValue = document.getElementById("totalValue");

const gstLabel = document.querySelector(".mini-summary .summary-line:nth-child(2) span");

const breakProduct = document.getElementById("breakProduct");
const breakPrice = document.getElementById("breakPrice");
const breakQuantity = document.getElementById("breakQuantity");
const breakGst = document.getElementById("breakGst");
const breakDate = document.getElementById("breakDate");
const breakTime = document.getElementById("breakTime");

const toast = document.getElementById("toast");

function formatCurrency(amount) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return "₹ " + safeAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function showToast(message, type = "error") {
  toast.textContent = message;
  toast.style.background = type === "success" ? "#1E3A5F" : "#1E293B";

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function addInputError(input) {
  input.style.boxShadow = `
    0 0 0 2px rgba(239, 68, 68, 0.35),
    18px 18px 30px rgba(13, 39, 80, 0.16),
    -18px -18px 30px rgba(255, 255, 255, 1)
  `;

  input.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-6px)" },
      { transform: "translateX(6px)" },
      { transform: "translateX(0)" },
    ],
    {
      duration: 260,
      easing: "ease-in-out",
    }
  );
}

function clearInputError(input) {
  input.style.boxShadow = "";
}

function getValues() {
  const productName = productNameInput.value.trim();

  const priceRaw = priceInput.value.trim();
  const quantityRaw = quantityInput.value.trim();
  const gstRaw = gstRateInput.value.trim();

  const price = parseFloat(priceRaw);
  const quantity = parseFloat(quantityRaw);
  const gstRate = parseFloat(gstRaw);

  return {
    productName,
    priceRaw,
    quantityRaw,
    gstRaw,
    price,
    quantity,
    gstRate,
  };
}

function resetSummary() {
  subtotalValue.textContent = "--";
  gstValue.textContent = "--";
  totalValue.textContent = "--";

  if (gstLabel) {
    gstLabel.textContent = "GST";
  }

  breakProduct.textContent = "Not entered";
  breakPrice.textContent = "--";
  breakQuantity.textContent = "--";
  breakGst.textContent = "--";
  breakDate.textContent = "--";
  breakTime.textContent = "--";
}

function calculateInvoice(showAnimation = true) {
  const { productName, price, quantity, gstRate } = getValues();

  const subtotal = price * quantity;
  const gstAmount = subtotal * (gstRate / 100);
  const total = subtotal + gstAmount;

  const now = new Date();

  subtotalValue.textContent = formatCurrency(subtotal);
  gstValue.textContent = `(${formatCurrency(gstAmount)})`;
  totalValue.textContent = formatCurrency(total);

  if (gstLabel) {
    gstLabel.textContent = `GST (${gstRate}%)`;
  }

  breakProduct.textContent = productName || "Not entered";
  breakPrice.textContent = formatCurrency(price);
  breakQuantity.textContent = quantity;
  breakGst.textContent = `${gstRate}%`;

  breakDate.textContent = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  breakTime.textContent = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (showAnimation) {
    animateResult(totalValue);
  }
}

function animateResult(element) {
  element.animate(
    [
      { transform: "scale(1)", opacity: 0.85 },
      { transform: "scale(1.05)", opacity: 1 },
      { transform: "scale(1)", opacity: 1 },
    ],
    {
      duration: 320,
      easing: "ease-out",
    }
  );
}

function canPreviewCalculate() {
  const { priceRaw, quantityRaw, gstRaw, price, quantity, gstRate } = getValues();

  return (
    priceRaw !== "" &&
    quantityRaw !== "" &&
    gstRaw !== "" &&
    Number.isFinite(price) &&
    Number.isFinite(quantity) &&
    Number.isFinite(gstRate) &&
    price > 0 &&
    quantity > 0 &&
    gstRate >= 0
  );
}

function validateForm() {
  const { productName, priceRaw, quantityRaw, gstRaw, price, quantity, gstRate } = getValues();

  clearInputError(productNameInput);
  clearInputError(priceInput);
  clearInputError(quantityInput);
  clearInputError(gstRateInput);

  if (!productName) {
    addInputError(productNameInput);
    productNameInput.focus();
    showToast("Please enter a product name.");
    return false;
  }

  if (priceRaw === "" || !Number.isFinite(price) || price <= 0) {
    addInputError(priceInput);
    priceInput.focus();
    showToast("Please enter a valid price.");
    return false;
  }

  if (quantityRaw === "" || !Number.isFinite(quantity) || quantity <= 0) {
    addInputError(quantityInput);
    quantityInput.focus();
    showToast("Please enter a valid quantity.");
    return false;
  }

  if (gstRaw === "" || !Number.isFinite(gstRate) || gstRate < 0) {
    addInputError(gstRateInput);
    gstRateInput.focus();
    showToast("Please enter a valid GST rate.");
    return false;
  }

  return true;
}

function updateActivePreset() {
  const currentGst = parseFloat(gstRateInput.value);

  presetButtons.forEach((button) => {
    const buttonGst = parseFloat(button.dataset.gst);

    if (Number.isFinite(currentGst) && currentGst === buttonGst) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function updatePreview() {
  updateActivePreset();

  if (canPreviewCalculate()) {
    calculateInvoice(false);
  } else {
    resetSummary();
  }
}

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    gstRateInput.value = button.dataset.gst;

    updatePreview();

    button.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.96)" },
        { transform: "scale(1)" },
      ],
      {
        duration: 180,
        easing: "ease-out",
      }
    );
  });
});

[productNameInput, priceInput, quantityInput, gstRateInput].forEach((input) => {
  input.addEventListener("input", () => {
    clearInputError(input);
    updatePreview();
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  calculateInvoice(true);
  showToast("Invoice calculated successfully.", "success");
});

resetSummary();
updateActivePreset();
