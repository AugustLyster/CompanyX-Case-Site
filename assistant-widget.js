const widget = {
  launcher: document.querySelector("#cxAssistantLauncher"),
  panel: document.querySelector("#cxAssistantPanel"),
  close: document.querySelector("#cxAssistantClose"),
  body: document.querySelector("#cxAssistantBody"),
  progress: Array.from(document.querySelectorAll("[data-widget-progress]")),
};

const widgetCase = {
  customerName: "Maria Andersen",
  phone: "22 41 08 96",
  invoice: "INV-2026-05-8821",
  variance: "+150 kr.",
};

const widgetSteps = ["question", "identity", "lookup", "answer"];
let widgetTimers = [];

function clearWidgetTimers() {
  widgetTimers.forEach((timer) => clearTimeout(timer));
  widgetTimers = [];
}

function setWidgetTimer(callback, delay) {
  const timer = setTimeout(callback, delay);
  widgetTimers.push(timer);
}

function setWidgetProgress(step) {
  const index = widgetSteps.indexOf(step);
  widget.progress.forEach((item) => {
    const itemIndex = widgetSteps.indexOf(item.dataset.widgetProgress);
    item.classList.toggle("active", item.dataset.widgetProgress === step);
    item.classList.toggle("done", itemIndex < index);
  });
}

function openWidget() {
  widget.panel.hidden = false;
  widget.launcher.setAttribute("aria-expanded", "true");
}

function closeWidget() {
  widget.panel.hidden = true;
  widget.launcher.setAttribute("aria-expanded", "false");
}

function renderQuestion() {
  clearWidgetTimers();
  setWidgetProgress("question");
  widget.body.innerHTML = `
    <section class="widget-step">
      <h2>Hvad kan vi hjælpe med?</h2>
      <p>Skriv spørgsmålet med dine egne ord. Hvis det handler om faktura, finder vi de relevante oplysninger.</p>

      <div class="widget-question-card">
        <label for="widgetQuestion">Dit spørgsmål</label>
        <textarea id="widgetQuestion">Hvorfor er min regning højere end normalt?</textarea>
      </div>

      <div class="widget-actions">
        <button class="widget-primary" type="button" id="widgetContinue">Fortsæt</button>
        <button class="widget-secondary" type="button" id="widgetOpenFull">Åbn fuld regningshjælp</button>
      </div>
    </section>
  `;

  document.querySelector("#widgetContinue").addEventListener("click", renderIdentity);
  document.querySelector("#widgetOpenFull").addEventListener("click", () => {
    window.location.href = "AI/";
  });
}

function renderIdentity() {
  setWidgetProgress("identity");
  widget.body.innerHTML = `
    <section class="widget-step">
      <h2>Find konto og faktura</h2>
      <p>Vi kan finde fakturaen automatisk via Mit Company X. Du kan også indtaste telefonnummer eller kundenummer.</p>

      <div class="widget-login-card">
        <span>Mit Company X</span>
        <strong>${widgetCase.customerName} er logget ind</strong>
        <p>Seneste faktura kan findes ud fra mobilnummeret på kontoen.</p>
        <button class="widget-primary" type="button" id="widgetAutoFind">Find automatisk</button>
      </div>

      <div class="widget-identity-card">
        <label for="widgetIdentifier">Telefonnummer eller kundenummer</label>
        <input id="widgetIdentifier" type="text" placeholder="22 41 08 96 eller CX-10488291" />
      </div>

      <div class="widget-actions">
        <button class="widget-secondary" type="button" id="widgetManualFind">Find faktura</button>
      </div>
    </section>
  `;

  document.querySelector("#widgetAutoFind").addEventListener("click", renderLookup);
  document.querySelector("#widgetManualFind").addEventListener("click", () => {
    const input = document.querySelector("#widgetIdentifier");
    if (!input.value.trim()) {
      input.focus();
      return;
    }
    renderLookup();
  });
}

function setLookupReady(id, text) {
  const row = document.querySelector(id);
  row.classList.add("ready");
  row.querySelector("em").textContent = text;
}

function renderLookup() {
  setWidgetProgress("lookup");
  widget.body.innerHTML = `
    <section class="widget-step">
      <h2>Finder forklaringen</h2>
      <p>Vi samler konto, faktura og forbrugsændringer, så svaret kan gives med det samme.</p>

      <div class="widget-lookup-card">
        <div class="widget-lookup-list">
          <div class="widget-lookup-row" id="widgetCrm"><strong>Kundeprofil</strong><em>Søger</em></div>
          <div class="widget-lookup-row" id="widgetInvoice"><strong>Seneste faktura</strong><em>Afventer</em></div>
          <div class="widget-lookup-row" id="widgetUsage"><strong>Forbrug og tilvalg</strong><em>Afventer</em></div>
        </div>
      </div>
    </section>
  `;

  setWidgetTimer(() => {
    setLookupReady("#widgetCrm", "Kunde fundet");
    document.querySelector("#widgetInvoice em").textContent = "Søger";
  }, 450);

  setWidgetTimer(() => {
    setLookupReady("#widgetInvoice", "Faktura fundet");
    document.querySelector("#widgetUsage em").textContent = "Sammenligner";
  }, 950);

  setWidgetTimer(() => {
    setLookupReady("#widgetUsage", "Forbrug matchet");
    renderAnswer();
  }, 1550);
}

function renderAnswer() {
  setWidgetProgress("answer");
  widget.body.innerHTML = `
    <section class="widget-step">
      <div class="widget-result-top">
        <div>
          <h2>Forklaringen er klar</h2>
          <p>Fakturaen er sammenlignet med sidste måned.</p>
        </div>
        <span class="widget-badge">${widgetCase.variance}</span>
      </div>

      <div class="widget-result-card">
        <div class="widget-result-summary">
          <span>${widgetCase.customerName} · ${widgetCase.invoice}</span>
          <strong>Regningen er højere på grund af to ændringer.</strong>
          <p>Dit faste mobilabonnement er uændret. Stigningen kommer fra ekstra data og en udløbet intropris.</p>
        </div>
      </div>

      <div class="widget-result-card widget-lines">
        <div><span>Ekstra data købt 18. maj</span><b>+100 kr.</b></div>
        <div><span>Streamingpakke intropris udløbet</span><b>+50 kr.</b></div>
        <div class="total"><span>Samlet afvigelse</span><b>+150 kr.</b></div>
      </div>

      <div class="widget-note">
        Hvis sagen sendes videre, følger kunde, faktura og forklaring automatisk med til kundeservice.
      </div>

      <div class="widget-actions">
        <button class="widget-primary" type="button" id="widgetSend">Send forklaring</button>
        <button class="widget-secondary" type="button" id="widgetService">Send til kundeservice</button>
      </div>
    </section>
  `;

  document.querySelector("#widgetSend").addEventListener("click", () => {
    document.querySelector(".widget-note").textContent =
      "Forklaringen er klar til at blive sendt via Mit Company X og mail.";
  });

  document.querySelector("#widgetService").addEventListener("click", () => {
    document.querySelector(".widget-note").textContent =
      "Sagen er sendt videre med kunde, faktura, afvigelse og forklaring.";
  });
}

widget.launcher.addEventListener("click", () => {
  if (widget.panel.hidden) {
    openWidget();
    renderQuestion();
  } else {
    closeWidget();
  }
});

widget.close.addEventListener("click", closeWidget);

renderQuestion();
