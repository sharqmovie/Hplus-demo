const fs = require("fs");
const path = require("path");

const appPath = path.join(process.cwd(), "src", "App.jsx");
let code = fs.readFileSync(appPath, "utf8");

function replaceOnce(find, replace, label) {
  if (!code.includes(find)) {
    console.log("Topilmadi yoki oldin o'zgargan:", label);
    return;
  }

  code = code.replace(find, replace);
  console.log("OK:", label);
}

// 1) Home chaqiruviga payments qo'shamiz
if (!code.includes("payments={payments}") || !code.includes("PatientPayments")) {
  replaceOnce(
    `                  finishDemoVisit={finishDemoVisit}
                />`,
    `                  finishDemoVisit={finishDemoVisit}
                  payments={payments}
                />`,
    "Home ga payments props qo'shildi"
  );
}

// 2) Patient to'lovlar sahifasini render qilamiz
if (!code.includes(`activeTab === "payments"`)) {
  replaceOnce(
    `          {activeTab === "emergency" && <EmergencyCard patient={patient} />}`,
    `          {activeTab === "payments" && <PatientPayments payments={payments} setPayments={setPayments} />}

          {activeTab === "emergency" && <EmergencyCard patient={patient} />}`,
    "PatientPayments render qo'shildi"
  );
}

// 3) Home props yangilaymiz
code = code.replace(
  `function Home({ patient, appointments, setActiveTab, finishDemoVisit }) {`,
  `function Home({ patient, appointments, setActiveTab, finishDemoVisit, payments = [] }) {`
);

// 4) Home ichiga kutilayotgan to'lov kartasini qo'shamiz
if (!code.includes("Kutilayotgan to'lov")) {
  replaceOnce(
    `      <section className="card">
        <div className="row">
          <div>
            <p className="label">Yaqin klinika</p>
            <h3>MedLine Clinic</h3>
            <p>1.2 km · Reyting 4.8 · Yunusobod</p>
          </div>
          <span className="mini">Open</span>
        </div>
      </section>`,
    `      {payments.some((item) => item.status !== "To'landi") && (
        <section className="card paymentNotice">
          <div className="row">
            <div>
              <p className="label">Kutilayotgan to'lov</p>
              <h3>{payments.find((item) => item.status !== "To'landi")?.amount || "0 so'm"}</h3>
              <p>Qabul uchun to'lovni bemor ilovasidan amalga oshirish mumkin.</p>
            </div>
            <button className="smallPayButton" onClick={() => setActiveTab("payments")}>
              To'lash
            </button>
          </div>
        </section>
      )}

      <section className="card">
        <div className="row">
          <div>
            <p className="label">Yaqin klinika</p>
            <h3>MedLine Clinic</h3>
            <p>1.2 km · Reyting 4.8 · Yunusobod</p>
          </div>
          <span className="mini">Open</span>
        </div>
      </section>`,
    "Home ga kutilayotgan to'lov kartasi qo'shildi"
  );
}

// 5) PatientPayments komponentini EmergencyCard oldidan qo'shamiz
if (!code.includes("function PatientPayments")) {
  const marker = "function EmergencyCard";
  const index = code.indexOf(marker);

  if (index === -1) {
    throw new Error("EmergencyCard funksiyasi topilmadi.");
  }

  const patientPaymentsFunction = `function PatientPayments({ payments = [], setPayments }) {
  function markPaid(id) {
    setPayments((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: "To'landi" } : item
      )
    );
  }

  const waitingPayments = payments.filter((item) => item.status !== "To'landi");
  const paidPayments = payments.filter((item) => item.status === "To'landi");

  return (
    <div className="screen">
      <div className="titleBlock">
        <p className="eyebrow">Patient payments</p>
        <h2>To'lovlarim</h2>
        <p>Klinika qabul va xizmatlari bo'yicha to'lov holati.</p>
      </div>

      <section className="card patientPaymentHero">
        <p className="label">Joriy holat</p>
        <h3>{waitingPayments.length > 0 ? "To'lov kutilmoqda" : "Qarzdorlik yo'q"}</h3>
        <p>
          {waitingPayments.length > 0
            ? "Quyidagi xizmat uchun demo to'lovni amalga oshiring."
            : "Barcha demo to'lovlar yakunlangan."}
        </p>
      </section>

      {payments.length === 0 ? (
        <section className="card">
          <h3>To'lov topilmadi</h3>
          <p>Navbat olganingizdan keyin bu yerda to'lov ma'lumoti paydo bo'ladi.</p>
        </section>
      ) : (
        <div className="paymentList">
          {payments.map((item) => (
            <section className="card patientPaymentCard" key={item.id}>
              <div className="row">
                <div>
                  <p className="label">{item.clinic}</p>
                  <h3>{item.service}</h3>
                  <p>{item.time}</p>
                </div>
                <span className="statusPill">{item.status}</span>
              </div>

              <div className="paymentAmount">
                <span>Summa</span>
                <b>{item.amount}</b>
              </div>

              {item.status !== "To'landi" ? (
                <button className="primary" onClick={() => markPaid(item.id)}>
                  Demo to'lov qilish
                </button>
              ) : (
                <div className="paidBox">
                  To'lov qabul qilindi. Klinika panelida ham status yangilanadi.
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {paidPayments.length > 0 && (
        <p className="disclaimer">
          Demo rejimida haqiqiy pul yechilmaydi. Bu faqat H+ to'lov oqimini ko'rsatish uchun.
        </p>
      )}
    </div>
  );
}

`;

  code = code.slice(0, index) + patientPaymentsFunction + code.slice(index);
  console.log("OK: PatientPayments komponenti qo'shildi");
}

// 6) BottomNav ga To'lov qo'shamiz
if (!code.includes(`{ id: "payments", label: "To'lov" }`)) {
  replaceOnce(
    `    { id: "ai", label: "AI" },
    { id: "emergency", label: "SOS" },`,
    `    { id: "ai", label: "AI" },
    { id: "payments", label: "To'lov" },
    { id: "emergency", label: "SOS" },`,
    "BottomNav ga To'lov qo'shildi"
  );
}

fs.writeFileSync(appPath, code, "utf8");
console.log("Tayyor: bemor PWA to'lovlar moduli qo'shildi.");