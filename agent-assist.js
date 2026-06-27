const lookupInput = document.querySelector("#lookupInput");
const lookupButton = document.querySelector("#lookupButton");
const caseStatus = document.querySelector("#caseStatus");
const customerMini = document.querySelector("#customerMini");
const analysisPanel = document.querySelector("#analysisPanel");
const resultArea = document.querySelector("#resultArea");
const suggestedAnswer = document.querySelector("#suggestedAnswer");
const answerMeta = document.querySelector("#answerMeta");
const caseNote = document.querySelector("#caseNote");
const sendEmail = document.querySelector("#sendEmail");
const createCase = document.querySelector("#createCase");
const finishCall = document.querySelector("#finishCall");
const dashboardLink = document.querySelector("#dashboardLink");
const callState = document.querySelector("#callState");
const callDuration = document.querySelector("#callDuration");
const refinementButtons = document.querySelectorAll(".refinement-actions button");

const cards = [
  {
    element: document.querySelector("#crmCard"),
    waiting: "Afventer opslag",
    processing: "Matcher telefonnummer",
    ready: "Maria Andersen fundet",
  },
  {
    element: document.querySelector("#invoiceCard"),
    waiting: "Afventer opslag",
    processing: "Henter maj-faktura",
    ready: "Maj 2026 · 549 kr.",
  },
  {
    element: document.querySelector("#usageCard"),
    waiting: "Afventer opslag",
    processing: "Sammenligner forbrug",
    ready: "+100 kr. data · +50 kr. streaming",
  },
  {
    element: document.querySelector("#historyCard"),
    waiting: "Afventer opslag",
    processing: "Tjekker åbne sager",
    ready: "Ingen dublet-sag",
  },
  {
    element: document.querySelector("#paymentCard"),
    waiting: "Afventer opslag",
    processing: "Kontrollerer betaling",
    ready: "Ingen restance",
  },
  {
    element: document.querySelector("#productCard"),
    waiting: "Afventer opslag",
    processing: "Matcher produktregler",
    ready: "Streaming-intro udløbet",
  },
  {
    element: document.querySelector("#contactCard"),
    waiting: "Afventer opslag",
    processing: "Tjekker kontaktvalg",
    ready: "Mail-samtykke aktivt",
  },
  {
    element: document.querySelector("#driftCard"),
    waiting: "Afventer opslag",
    processing: "Tjekker driftsstatus",
    ready: "Ingen relevant hændelse",
  },
];

const answerText =
  "Maria, jeg kan se, at dit abonnement ikke er ændret. Regningen er 150 kr. højere, fordi der er købt ekstra data for 100 kr., og fordi introprisen på streamingpakken er udløbet med 50 kr. Jeg sender dig en kort oversigt på mail, så du har forklaringen på skrift.";

const answerVariants = {
  short:
    "Maria, din regning er 150 kr. højere end normalt. Det skyldes ekstra data for 100 kr. og en streaming-intropris, der er udløbet med 50 kr. Jeg sender forklaringen til dig på mail.",
  empathy:
    "Maria, jeg kan godt forstå, at det er frustrerende, når regningen pludselig er højere. Jeg har tjekket dine data, og abonnementet er ikke ændret. Stigningen på 150 kr. skyldes ekstra data for 100 kr. samt en streaming-intropris, der nu er udløbet med 50 kr. Jeg sender dig en oversigt på mail, så du har forklaringen på skrift.",
  sources:
    "Maria, jeg har sammenholdt CRM, maj-fakturaen, forbrugsloggen og produktreglerne. De viser, at normalprisen er 399 kr., mens maj-fakturaen er 549 kr. Forskellen på 150 kr. består af ekstra data for 100 kr. og en udløbet streaming-intropris på 50 kr.",
};

const noteText =
  `<dl>
    <div>
      <dt>Call-id</dt>
      <dd>CXCALL-2026-06-25-0914 · indgående nummer 22 41 08 96</dd>
    </div>
    <div>
      <dt>Kunde</dt>
      <dd>Maria Andersen · CX-10488291 · mobil + fiber · seneste rating 4,6/5</dd>
    </div>
    <div>
      <dt>Datakilder</dt>
      <dd>CRM, faktura INV-2026-05-8821, forbrugslog, betaling, produktregler, kontaktvalg, drift og sagshistorik matchet.</dd>
    </div>
    <div>
      <dt>Årsag</dt>
      <dd>Maj-regning 549 kr. mod normal 399 kr. Afvigelse +150 kr.: ekstra data 18/05 +100 kr. og udløbet streaming-intropris +50 kr.</dd>
    </div>
    <div>
      <dt>Handling</dt>
      <dd>Forklaring givet i samtale. Skriftlig oversigt kan sendes til maria.andersen@email.dk. Ingen åben dublet-sag og ingen kompensation foreslået.</dd>
    </div>
    <div>
      <dt>Træningstags</dt>
      <dd>billing_variance · add_on_data · promo_expiry · mail_consent_ok · resolved_first_contact · verified_by_agent</dd>
    </div>
  </dl>`;

function setCardState(card, state) {
  const status = card.element.querySelector("em");
  card.element.classList.remove("processing", "ready");
  if (state === "processing") {
    card.element.classList.add("processing");
    status.textContent = card.processing;
  } else if (state === "ready") {
    card.element.classList.add("ready");
    status.textContent = card.ready;
  } else {
    status.textContent = card.waiting;
  }
}

function resetLookup() {
  cards.forEach((card) => setCardState(card, "waiting"));
  analysisPanel.classList.add("hidden");
  resultArea.classList.add("hidden");
  customerMini.classList.remove("is-ready");
  customerMini.innerHTML = `
    <span>Kunde</span>
    <strong>Afventer opslag</strong>
    <small>SIGNAL AGENT samler relevante kilder, når opkaldet matches.</small>
  `;
  suggestedAnswer.textContent =
    "Slå kunden op for at få et kvalitetssikret svar, Mikkel kan bruge i samtalen.";
  answerMeta.textContent = "Afventer datagrundlag · Mikkel godkender før afsendelse";
  caseNote.textContent =
    "Intet notat endnu. SIGNAL AGENT opretter et kort notat, når data er matchet.";
  sendEmail.textContent = "Godkend og send mail";
  createCase.textContent = "Opret sag";
  finishCall.textContent = "Afslut samtale";
  refinementButtons.forEach((button) => button.classList.remove("is-active"));
  dashboardLink.classList.add("hidden");
  finishCall.closest(".finish-card").classList.remove("is-done");
  callState.textContent = "Indgående opkald";
  callDuration.textContent = "02:14";
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function runLookup() {
  const value = lookupInput.value.trim();
  if (!value) {
    lookupInput.focus();
    return;
  }

  lookupButton.disabled = true;
  lookupButton.textContent = "Søger";
  caseStatus.textContent = "Analyserer kilder";
  caseStatus.className = "case-status processing";
  resetLookup();
  analysisPanel.classList.remove("hidden");

  for (const card of cards) {
    setCardState(card, "processing");
    await delay(260);
    setCardState(card, "ready");
  }

  await delay(520);

  customerMini.classList.add("is-ready");
  customerMini.innerHTML = `
    <span>Kunde</span>
    <strong>Maria Andersen</strong>
    <small>CX-10488291 · 8 systemkilder matchet · normalt 399 kr./md.</small>
  `;

  analysisPanel.classList.add("hidden");
  resultArea.classList.remove("hidden");
  suggestedAnswer.textContent = answerText;
  answerMeta.textContent = "Verificeret på 8 kilder · Mikkel godkender før afsendelse";
  caseNote.innerHTML = noteText;
  caseStatus.textContent = "Forklaring klar";
  caseStatus.className = "case-status ready";
  lookupButton.disabled = false;
  lookupButton.textContent = "Slå op";
}

lookupButton.addEventListener("click", runLookup);

lookupInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    runLookup();
  }
});

sendEmail.addEventListener("click", () => {
  if (resultArea.classList.contains("hidden")) return;
  sendEmail.textContent = "Mail godkendt og sendt";
  answerMeta.textContent = "Godkendt af Mikkel · sendt til maria.andersen@email.dk";
  caseStatus.textContent = "Muligt svar sendt";
});

createCase.addEventListener("click", () => {
  if (resultArea.classList.contains("hidden")) return;
  createCase.textContent = "Sag oprettet";
  caseStatus.textContent = "Sagsnotat gemt";
});

refinementButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (resultArea.classList.contains("hidden")) return;
    refinementButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    suggestedAnswer.textContent = answerVariants[button.dataset.tone] || answerText;
    caseStatus.textContent = "Svar tilpasset";
  });
});

finishCall.addEventListener("click", () => {
  if (resultArea.classList.contains("hidden")) return;
  finishCall.textContent = "Samtale afsluttet";
  finishCall.closest(".finish-card").classList.add("is-done");
  dashboardLink.classList.remove("hidden");
  caseStatus.textContent = "Samtale afsluttet · CRM og dashboard opdateret";
  callState.textContent = "Samtale afsluttet";
  callDuration.textContent = "03:05";
});
