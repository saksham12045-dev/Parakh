const CONFIG = {
  N8N_WEBHOOK_URL:
    "https://yashsingh8.app.n8n.cloud/webhook/3274f1c9-ede9-4354-8733-c0997a67bb38",
};
const OFFICIAL_RULES_PDF = "assets/rulebook.pdf";
let selectedFile = null,
  currentResult = null,
  currentFilter = "all";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
function toast(m) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = m;
  t.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => t.classList.remove("show"), 2600);
}
function setView(v) {
  $$(".view").forEach((x) => x.classList.remove("active-view"));
  const t = $("#view-" + v);
  if (t) t.classList.add("active-view");
  $$(".nav-link").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === v),
  );
  scrollTo({ top: 0, behavior: "smooth" });
}
function badge(s) {
  return `<span class="badge ${s}">${{ compliant: "COMPLIANT", flagged: "FLAGGED", review: "REVIEW" }[s] || "REVIEW"}</span>`;
}
function renderEmptyStates() {
  const history = JSON.parse(
    localStorage.getItem("parakhHistory") || "[]"
  );

  // -------------------------
  // COUNT INSPECTIONS
  // -------------------------

  const total = history.length;

  const compliant = history.filter((item) => {
    return String(item.status).toLowerCase() === "compliant";
  }).length;

  const failed = history.filter((item) => {
    const status = String(item.status).toLowerCase();

    return (
      status === "failed" ||
      status === "flagged"
    );
  }).length;

  const review = history.filter((item) => {
    const status = String(item.status).toLowerCase();

    return (
      status === "review" ||
      status === "under review"
    );
  }).length;

  // -------------------------
  // UPDATE ACTIVITY CARD
  // -------------------------

  $("#inspectionCount").textContent = total;
  $("#compliantCount").textContent = compliant;
  $("#flaggedCount").textContent = failed;
  $("#reviewCount").textContent = review;

  // -------------------------
  // UPDATE RECENT INSPECTIONS
  // -------------------------

  const recentBody = $("#recentTableBody");

  if (!recentBody) return;

  if (history.length === 0) {
    recentBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-table">
          No inspections yet. Completed inspections will appear here.
        </td>
      </tr>
    `;

    return;
  }

  recentBody.innerHTML = history
    .slice(0, 5)
    .map((item) => {
      const rawStatus = String(
        item.status || "review"
      ).toLowerCase();

      let statusClass = "review";
      let displayStatus = "UNDER REVIEW";

      if (rawStatus === "compliant") {
        statusClass = "compliant";
        displayStatus = "COMPLIANT";
      } else if (
        rawStatus === "failed" ||
        rawStatus === "flagged"
      ) {
        // FAILED is treated as the red/flagged category
        statusClass = "flagged";
        displayStatus = "FAILED";
      }

      const declarations =
        item.result?.ingredients?.length || 0;

      return `
        <tr>
          <td>
            <strong>${item.productName || "Not Available"}</strong>
            <small>${item.brand || ""}</small>
          </td>

          <td>
            ${item.date || "Not Available"}
          </td>

          <td>
            ${declarations} detected
          </td>

          <td>
            <span class="badge ${statusClass}">
              ${displayStatus}
            </span>
          </td>

          <td>
            <button
              class="text-link dashboard-history-view"
              data-id="${item.id}"
              type="button"
            >
              View →
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}
function renderResult(r) {
  console.log("RESULT RECEIVED BY renderResult:", r);
  console.log("PRODUCT:", r.productName, "BRAND:", r.brand);
  currentResult = r;

  const p = $("#resultPanel");

  const ingredients =
    Array.isArray(r.ingredients) && r.ingredients.length
      ? r.ingredients.join(", ")
      : "Not Available";

  const nutrition = r.nutritionalInformation || {};

  const fields = [
    ["Product Name", r.productName, "ok"],
    ["Brand", r.brand, "ok"],
    ["Category", r.category, "ok"],
    ["Description", r.description, "ok"],
    ["Net Quantity", r.netQuantity, "ok"],
    ["Price", r.price, "ok"],
    ["Ingredients", ingredients, "ok"],
    ["Allergens", r.allergens, "ok"],
    ["Country of Origin", r.countryOfOrigin, "ok"],
    ["Storage Instructions", r.storageInstructions, "ok"],
    ["Usage Instructions", r.usageInstructions, "ok"],
    ["Customer Care", r.customerCare, "ok"],
    ["Manufacturing Date", r.manufacturingDate, "ok"],
    ["Expiry / Best Before", r.expiryDate, "ok"],
    ["Batch Number", r.batchNumber, "ok"],
    ["Manufacturer", r.manufacturer, "ok"]
  ];

  p.innerHTML = `
    <div class="result-head">
      <div>
        <p class="eyebrow">Screening result</p>
        <h2>${r.productName}</h2>
        <p class="result-brand">${r.brand}</p>
      </div>

      ${badge(r.status)}
    </div>

    <div class="result-body">

      <div class="result-summary">

        <div class="result-status ${r.status}">
          <strong>${r.statusText}</strong>
          <p>${r.summary}</p>
        </div>

        <div>
          <p class="eyebrow">Screening note</p>
          <p class="lede" style="font-size:.78rem">
            ${r.ruleNote}
          </p>
        </div>

      </div>

      <div class="field-grid">

        ${fields
          .map(
            ([label, value, state]) => `
              <div class="field-result">
                <strong>${label}</strong>
                <span class="field-${state}">
  ${
    String(value).trim().toLowerCase() === "not available"
      ? "—"
      : state === "ok"
      ? "✓"
      : "!"
  }
  ${value}
</span>
              </div>
            `
          )
          .join("")}

      </div>

      <div class="nutrition-section">

        <p class="eyebrow">Nutritional Information</p>

        <div class="field-grid">

          <div class="field-result">
            <strong>Serving Size</strong>
            <span>
              ${nutrition.servingSize || "Not Available"}
            </span>
          </div>

          <div class="field-result">
            <strong>Energy</strong>
            <span>
              ${nutrition.energy || "Not Available"}
            </span>
          </div>

          <div class="field-result">
            <strong>Protein</strong>
            <span>
              ${nutrition.protein || "Not Available"}
            </span>
          </div>

          <div class="field-result">
            <strong>Carbohydrate</strong>
            <span>
              ${nutrition.carbohydrate || "Not Available"}
            </span>
          </div>

          <div class="field-result">
            <strong>Sugar</strong>
            <span>
              ${nutrition.sugar || "Not Available"}
            </span>
          </div>

          <div class="field-result">
            <strong>Total Fat</strong>
            <span>
              ${nutrition.fat || "Not Available"}
            </span>
          </div>

        </div>

      </div>

      <div class="result-footer">

        <small>
          This screening interface provides assistance.
          Confirm applicable requirements against the current
          legal text and authorised inspection procedure.
        </small>

        <div style="display:flex;gap:8px">

          <button
            class="btn btn-secondary"
            id="openRulesBtn"
            type="button"
          >
            View rules ↗
          </button>

          <button
            class="btn btn-primary"
            id="exportInlineBtn"
            type="button"
          >
            Export summary
          </button>

        </div>

      </div>

    </div>
  `;

  p.classList.remove("hidden");

  $("#openRulesBtn").onclick = () =>
    window.open(
      OFFICIAL_RULES_PDF,
      "_blank",
      "noopener"
    );

  $("#exportInlineBtn").onclick = exportReport;

  toast("Screening result ready for review");
}
function normalize(d) {
  // n8n returns an array, so take the first object
  const result = Array.isArray(d) ? d[0] : d;

  const report = result?.report || {};

  // -------------------------
  // COUNT MISSING FIELDS
  // -------------------------

  const fieldsToCheck = [
    report.productName,
    report.brand,
    report.category,
    report.description,
    report.netQuantity,
    report.price,
    report.ingredients,
    report.allergens,
    report.countryOfOrigin,
    report.storageInstructions,
    report.usageInstructions,
    report.customerCare,
    report.manufacturingDate,
    report.expiryDate,
    report.batchNumber,
    report.manufacturer
  ];

  const missingFields = fieldsToCheck.filter((value) => {
    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return (
      value === undefined ||
      value === null ||
      String(value).trim() === "" ||
      String(value).trim().toLowerCase() === "not available"
    );
  });

  const missingCount = missingFields.length;

  // -------------------------
  // DETERMINE STATUS
  // -------------------------

  let status = "compliant";
  let statusText = "COMPLIANT";

  if (missingCount > 2) {
    status = "failed";
    statusText = "FAILED";
  } else if (missingCount > 0) {
    status = "review";
    statusText = "UNDER REVIEW";
  }

  // -------------------------
  // RETURN NORMALIZED RESULT
  // -------------------------

  return {
    productName:
      report.productName ||
      result?.product_name ||
      "Not Available",

    brand:
      report.brand ||
      result?.brand ||
      "Not Available",

    category:
      report.category ||
      "Not Available",

    description:
      report.description ||
      "Not Available",

    netQuantity:
      report.netQuantity ||
      "Not Available",

    price:
      report.price ||
      "Not Available",

    ingredients:
      Array.isArray(report.ingredients)
        ? report.ingredients
        : [],

    allergens:
      report.allergens ||
      "Not Available",

    countryOfOrigin:
      report.countryOfOrigin ||
      "Not Available",

    storageInstructions:
      report.storageInstructions ||
      "Not Available",

    usageInstructions:
      report.usageInstructions ||
      "Not Available",

    customerCare:
      report.customerCare ||
      "Not Available",

    nutritionalInformation: {
      servingSize:
        report.nutritionalInformation?.servingSize ||
        "Not Available",

      protein:
        report.nutritionalInformation?.protein ||
        "Not Available",

      carbohydrate:
        report.nutritionalInformation?.carbohydrate ||
        "Not Available",

      sugar:
        report.nutritionalInformation?.sugar ||
        "Not Available",

      fat:
        report.nutritionalInformation?.fat ||
        "Not Available",

      energy:
        report.nutritionalInformation?.energy ||
        "Not Available"
    },

    manufacturingDate:
      report.manufacturingDate ||
      "Not Available",

    expiryDate:
      report.expiryDate ||
      "Not Available",

    batchNumber:
      report.batchNumber ||
      "Not Available",

    manufacturer:
      report.manufacturer ||
      "Not Available",

    // -------------------------
    // COMPLIANCE RESULT
    // -------------------------

    complianceStatus:
      statusText,

    status:
      status,

    statusText:
      statusText,

    missingCount:
      missingCount,

    missingFields:
      missingFields,

    summary:
      missingCount === 0
        ? "All required label information was successfully extracted."
        : `${missingCount} field${missingCount > 1 ? "s are" : " is"} not available and require${missingCount === 1 ? "s" : ""} review.`,

    ruleNote:
      "This result is based on the availability of extracted label information. Confirm applicable requirements against the current legal text and authorised inspection procedure."
  };
}
function handleFile(f) {
  if (!f || !f.type.startsWith("image/"))
    return toast("Please choose an image file");
  selectedFile = f;
  const r = new FileReader();
  r.onload = (e) => {
    $("#previewImage").src = e.target.result;
    $("#fileName").textContent = f.name;
    $("#fileMeta").textContent =
      `${Math.round(f.size / 1024)} KB · ready for screening`;
    $("#filePreview").classList.remove("hidden");
    $("#dropzone").classList.add("hidden");
    $("#inspectBtn").disabled = false;
  };
  r.readAsDataURL(f);
}
function resetFile() {
  selectedFile = null;
  $("#productFile").value = "";
  $("#filePreview").classList.add("hidden");
  $("#dropzone").classList.remove("hidden");
  $("#inspectBtn").disabled = true;
}
function saveToHistory(r) {
  const history = JSON.parse(localStorage.getItem("parakhHistory") || "[]");

  history.unshift({
    id: Date.now(),
    productName: r.productName,
    brand: r.brand,
    date: new Date().toLocaleDateString("en-IN"),
    status: r.complianceStatus,
    result: r,
  });

  localStorage.setItem("parakhHistory", JSON.stringify(history.slice(0, 50)));
}
function renderHistory() {
  const tbody = $("#historyTableBody");

  const history = JSON.parse(localStorage.getItem("parakhHistory") || "[]");

  if (!history.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="empty-table">No inspections yet. Completed inspections will appear here.</td></tr>';
    return;
  }

  tbody.innerHTML = history
    .map(
      (item) => `
    <tr>
      <td>
        <strong>${item.productName}</strong>
        <small>${item.brand}</small>
      </td>

      <td>${item.date}</td>

      <td>Product details</td>

      <td>
        <span class="history-status">${item.status}</span>
      </td>

      <td>
        <button
          class="text-link history-view"
          data-id="${item.id}"
          type="button"
        >
          View report →
        </button>
      </td>
    </tr>
  `,
    )
    .join("");

  $$(".history-view").forEach((button) => {
    button.onclick = () => {
      const item = history.find((x) => String(x.id) === button.dataset.id);

      if (!item) return;

      currentResult = item.result;

      renderResult(item.result);

      // Go to inspection/result section
      const resultPanel = $("#resultPanel");

      if (resultPanel) {
        resultPanel.classList.remove("hidden");
        resultPanel.scrollIntoView({
          behavior: "smooth",
        });
      }
    };
  });
}

async function runInspection() {
  if (!selectedFile) return toast("Select a product image first");

  if (!CONFIG.N8N_WEBHOOK_URL)
    return toast("Inspection service is not connected yet.");

  const b = $("#inspectBtn");
  b.disabled = true;
  b.textContent = "Processing…";
  $("#resultPanel").classList.add("hidden");

  try {
    const f = new FormData();
    f.append("file", selectedFile);

    const response = await fetch(CONFIG.N8N_WEBHOOK_URL, {
      method: "POST",
      body: f,
    });

    console.log("HTTP status:", response.status);
    console.log("HTTP ok:", response.ok);

    const raw = await response.text();

    console.log("RAW n8n RESPONSE:", raw);

    if (!response.ok) {
      throw new Error("Webhook returned HTTP " + response.status);
    }

    if (!raw.trim()) {
      throw new Error("n8n returned an empty response");
    }

    let data;

    try {
      data = JSON.parse(raw);
    } catch (error) {
      console.error("Response is not valid JSON:", raw);
      throw new Error("n8n did not return valid JSON");
    }

    console.log("PARSED n8n RESPONSE:", data);

    const result = normalize(data);
    saveToHistory(result);
    renderEmptyStates();
    renderHistory();

    console.log("NORMALIZED RESULT:", result);

    renderResult(result);
  } catch (e) {
    console.error("INSPECTION ERROR:", e);

    toast("Inspection failed: " + e.message);
  } finally {
    b.disabled = false;
    b.innerHTML = "Start inspection <span>→</span>";
  }
}
function exportReport() {
  if (!currentResult) {
    return toast("No inspection result to export");
  }

  const r = currentResult;
  const nutrition = r.nutritionalInformation || {};

  const ingredients =
    Array.isArray(r.ingredients) && r.ingredients.length
      ? r.ingredients.join(", ")
      : "Not Available";

  const text = `PARAKH — INSPECTION SCREENING SUMMARY

PRODUCT INFORMATION

Product Name: ${r.productName}
Brand: ${r.brand}
Category: ${r.category}
Description: ${r.description}
Net Quantity: ${r.netQuantity}
Price: ${r.price}

DECLARATIONS

Ingredients: ${ingredients}
Allergens: ${r.allergens}
Country of Origin: ${r.countryOfOrigin}
Storage Instructions: ${r.storageInstructions}
Usage Instructions: ${r.usageInstructions}
Customer Care: ${r.customerCare}

NUTRITIONAL INFORMATION

Serving Size: ${nutrition.servingSize || "Not Available"}
Energy: ${nutrition.energy || "Not Available"}
Protein: ${nutrition.protein || "Not Available"}
Carbohydrate: ${nutrition.carbohydrate || "Not Available"}
Sugar: ${nutrition.sugar || "Not Available"}
Fat: ${nutrition.fat || "Not Available"}

MANUFACTURING INFORMATION

Manufacturing Date: ${r.manufacturingDate}
Expiry / Best Before: ${r.expiryDate}
Batch Number: ${r.batchNumber}
Manufacturer: ${r.manufacturer}

COMPLIANCE STATUS

Status: ${r.statusText}

SCREENING NOTE

${r.ruleNote}

Regulatory reference:
Legal Metrology (Packaged Commodities) Rules, 2011

Screening assistance only. Confirm applicable requirements against the current legal text and authorised inspection procedure.
`;

  const blob = new Blob(
    [text],
    {
      type: "text/plain;charset=utf-8"
    }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download =
    `Parakh-${r.productName
      .replace(/[^a-z0-9]+/gi, "-")}-screening.txt`;

  a.click();

  URL.revokeObjectURL(url);

  toast("Screening summary exported");
}
$("#enterAppBtn").onclick = () => {
  $("#coverPage").classList.add("hidden");
  $("#appShell").classList.remove("hidden");
  scrollTo({ top: 0, behavior: "instant" });
};
$("#returnCoverBtn").onclick = () => {
  $("#appShell").classList.add("hidden");
  $("#coverPage").classList.remove("hidden");
  scrollTo({ top: 0, behavior: "instant" });
};
$$("[data-view]").forEach((e) => (e.onclick = () => setView(e.dataset.view)));
$("#aboutBtn").onclick = () =>
  $("#aboutParaakh").scrollIntoView({ behavior: "smooth" });
$("#productFile").onchange = (e) => handleFile(e.target.files[0]);
$("#removeFile").onclick = resetFile;
$("#inspectBtn").onclick = runInspection;
const dz = $("#dropzone");
["dragenter", "dragover"].forEach((e) =>
  dz.addEventListener(e, (x) => {
    x.preventDefault();
    dz.classList.add("dragging");
  }),
);
["dragleave", "drop"].forEach((e) =>
  dz.addEventListener(e, (x) => {
    x.preventDefault();
    dz.classList.remove("dragging");
  }),
);
dz.addEventListener("drop", (e) => handleFile(e.dataTransfer.files[0]));
$$(".filter").forEach(
  (b) =>
  (b.onclick = () => {
    currentFilter = b.dataset.filter;
    $$(".filter").forEach((x) => x.classList.toggle("active", x === b));
    renderEmptyStates();
  }),
);
renderEmptyStates();
renderHistory();
