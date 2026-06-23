/* =============================================
   SMART GST INVOICE CALCULATOR — SCRIPT
   ============================================= */

(function () {
  'use strict';

  /* ── DOM References ── */
  const productInput  = document.getElementById('productName');
  const priceInput    = document.getElementById('pricePerUnit');
  const qtyInput      = document.getElementById('quantity');
  const gstInput      = document.getElementById('gstRate');
  const calcBtn       = document.getElementById('calculateBtn');
  const presetBtns    = document.querySelectorAll('.preset-btn');

  // Summary display
  const subtotalDisplay = document.getElementById('subtotalDisplay');
  const gstDisplay      = document.getElementById('gstDisplay');
  const totalDisplay    = document.getElementById('totalDisplay');

  // Breakdown display
  const bdProduct  = document.getElementById('bdProduct');
  const bdPrice    = document.getElementById('bdPrice');
  const bdQty      = document.getElementById('bdQty');
  const bdGst      = document.getElementById('bdGst');
  const bdSubtotal = document.getElementById('bdSubtotal');
  const bdGstAmt   = document.getElementById('bdGstAmt');
  const bdTotal    = document.getElementById('bdTotal');
  const bdDate     = document.getElementById('bdDate');
  const bdTime     = document.getElementById('bdTime');

  // Toast
  const toast = document.getElementById('toast');
  let toastTimer = null;

  /* ── Utility: Indian currency format ── */
  function formatINR(amount) {
    const formatted = amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return '₹\u00A0' + formatted;
  }

  /* ── Toast ── */
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /* ── Shake animation ── */
  function shakeInput(el) {
    el.classList.remove('shake');
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add('shake');
    el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
  }

  /* ── Pop animation for result values ── */
  function popValue(el, value) {
    el.classList.remove('value-pop');
    void el.offsetWidth;
    el.textContent = value;
    el.classList.add('value-pop');
  }

  /* ── Preset GST buttons ── */
  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const rate = btn.getAttribute('data-rate');
      gstInput.value = rate;
      presetBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      // Trigger real-time update
      tryLiveUpdate();
    });
  });

  /* ── Sync presets when user manually types GST ── */
  gstInput.addEventListener('input', () => {
    const typed = parseFloat(gstInput.value);
    presetBtns.forEach((btn) => {
      const rate = parseFloat(btn.getAttribute('data-rate'));
      const isMatch = !isNaN(typed) && typed === rate;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });
    tryLiveUpdate();
  });

  /* ── Real-time update on price / qty input ── */
  priceInput.addEventListener('input', tryLiveUpdate);
  qtyInput.addEventListener('input', tryLiveUpdate);

  function tryLiveUpdate() {
    const price = parseFloat(priceInput.value);
    const qty   = parseFloat(qtyInput.value);
    const gst   = parseFloat(gstInput.value);

    if (
      !isNaN(price) && price > 0 &&
      !isNaN(qty)   && qty > 0 &&
      !isNaN(gst)   && gst >= 0
    ) {
      updateSummary(price, qty, gst, null, false);
    }
  }

  /* ── Calculate Button ── */
  calcBtn.addEventListener('click', () => {
    const productName = productInput.value.trim();
    const price       = parseFloat(priceInput.value);
    const qty         = parseFloat(qtyInput.value);
    const gst         = parseFloat(gstInput.value);

    // Validation
    if (!productName) {
      showToast('Please enter a product name.');
      shakeInput(productInput);
      productInput.focus();
      return;
    }
    if (!priceInput.value || isNaN(price) || price <= 0) {
      showToast('Please enter a valid price.');
      shakeInput(priceInput);
      priceInput.focus();
      return;
    }
    if (!qtyInput.value || isNaN(qty) || qty <= 0) {
      showToast('Please enter a valid quantity.');
      shakeInput(qtyInput);
      qtyInput.focus();
      return;
    }
    if (!gstInput.value || isNaN(gst) || gst < 0) {
      showToast('Please enter a valid GST rate.');
      shakeInput(gstInput);
      gstInput.focus();
      return;
    }

    updateSummary(price, qty, gst, productName, true);
  });

  /* ── Core: Update summary & breakdown ── */
  function updateSummary(price, qty, gst, productName, withBreakdown) {
    const subtotal  = price * qty;
    const gstAmt    = subtotal * gst / 100;
    const total     = subtotal + gstAmt;

    popValue(subtotalDisplay, formatINR(subtotal));
    popValue(gstDisplay,      formatINR(gstAmt));
    popValue(totalDisplay,    formatINR(total));

    if (withBreakdown && productName !== null) {
      const now = new Date();

      const dateStr = now.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      });

      bdProduct.textContent  = productName || 'Not entered';
      bdPrice.textContent    = formatINR(price);
      bdQty.textContent      = qty % 1 === 0 ? qty.toFixed(0) : qty.toString();
      bdGst.textContent      = gst + '%';
      bdSubtotal.textContent = formatINR(subtotal);
      bdGstAmt.textContent   = formatINR(gstAmt);
      bdTotal.textContent    = formatINR(total);
      bdDate.textContent     = dateStr;
      bdTime.textContent     = timeStr;
    }
  }

})();
