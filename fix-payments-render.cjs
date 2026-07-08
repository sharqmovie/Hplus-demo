const fs = require("fs");
const path = require("path");

const appPath = path.join(process.cwd(), "src", "App.jsx");
let code = fs.readFileSync(appPath, "utf8");

// 1) payments state borligini tekshiramiz
if (!code.includes('hplus-demo-payments')) {
  code = code.replace(
    '  const [history, setHistory] = useStoredState("hplus-demo-history", defaultHistory);',
    '  const [history, setHistory] = useStoredState("hplus-demo-history", defaultHistory);\n  const [payments, setPayments] = useStoredState("hplus-demo-payments", defaultPayments);'
  );
}

// 2) ClinicAdmin chaqiruvida payments props borligini tekshiramiz
if (!code.includes('payments={payments}')) {
  code = code.replace(
    '            patient={patient}\n            setHistory={setHistory}\n          />',
    '            patient={patient}\n            setHistory={setHistory}\n            payments={payments}\n            setPayments={setPayments}\n          />'
  );
}

// 3) ClinicAdmin funksiyasida payments props borligini tekshiramiz
code = code.replace(
  /function ClinicAdmin\(\{ adminTab, setAdminTab, appointments, patients, updateAppointmentStatus, patient, setHistory(?:, payments, setPayments)? \}\) \{/,
  'function ClinicAdmin({ adminTab, setAdminTab, appointments, patients, updateAppointmentStatus, patient, setHistory, payments = [], setPayments }) {'
);

// 4) O'ng tomonda To'lovlar sahifasi render bo'lishini majburan qo'shamiz
if (!code.includes('adminTab === "payments" && <AdminPayments')) {
  code = code.replace(
    '        {adminTab === "patients" && <AdminPatients patients={patients} />}\n        {adminTab === "reports" && <AdminReports appointments={appointments} />}',
    '        {adminTab === "patients" && <AdminPatients patients={patients} />}\n        {adminTab === "payments" && <AdminPayments payments={payments} setPayments={setPayments} />}\n        {adminTab === "reports" && <AdminReports appointments={appointments} />}'
  );
}

// 5) Agar AdminPayments funksiyasi umuman bo'lmasa, qo'shamiz
if (!code.includes("function AdminPayments")) {
  const marker = "function AdminReports";
  const index = code.indexOf(marker);

  if (index === -1) {
    throw new Error("AdminReports topilmadi.");
  }

  const fn = `function AdminPayments({ payments = [], setPayments }) {
  function parseAmount(value) {
    const digits = String(value).replace(/\\D/g, "");
    return Number(digits || 0);
  }

  const total = payments.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const paid = payments
    .filter((item) => item.status === "To'landi")
    .reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const waiting = total - paid;

  function markPaid(id) {
    if (!setPayments) return;

    setPayments((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: "To'landi" } : item
      )
    );
  }

  function markWaiting(id) {
    if (!setPayments) return;

    setPayments((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: "Kutilmoqda" } : item
      )
    );
  }

  return (
    <div className="adminScreen">
      <AdminTitle
        title="To'lovlar"
        text="Qabul va xizmatlar bo'yicha klinikaning kunlik moliyaviy nazorati."
      />

      <div className="statsGrid">
        <AdminStat label="Jami hisob" value={total.toLocaleString("ru-RU")} suffix="so'm" />
        <AdminStat label="To'langan" value={paid.toLocaleString("ru-RU")} suffix="so'm" />
        <AdminStat label="Kutilmoqda" value={waiting.toLocaleString("ru-RU")} suffix="so'm" />
        <AdminStat label="Cheklar soni" value={payments.length} />
      </div>

      <section className="adminCard">
        <h3>Bugungi to'lovlar</h3>

        {payments.length === 0 ? (
          <p>Hozircha to'lov yo'q. Bemor tomondan yangi navbat olinganda bu yerda to'lov chiqadi.</p>
        ) : (
          <div className="table paymentTable">
            <div className="tableHead paymentHead">
              <span>Bemor</span>
              <span>Xizmat</span>
              <span>Vaqt</span>
              <span>Summa</span>
              <span>Status</span>
              <span>Amal</span>
            </div>

            {payments.map((item) => (
              <div className="tableRow paymentRow" key={item.id}>
                <span>
                  <b>{item.patient}</b>
                  <small>{item.patientId}</small>
                </span>

                <span>
                  <b>{item.service}</b>
                  <small>{item.clinic}</small>
                </span>

                <span>{item.time}</span>
                <span><b>{item.amount}</b></span>
                <span className="statusPill">{item.status}</span>

                <span className="actions">
                  <button onClick={() => markPaid(item.id)}>To'landi</button>
                  <button onClick={() => markWaiting(item.id)}>Kutilmoqda</button>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="adminCard paymentSummary">
        <h3>Demo izoh</h3>
        <p>
          H+ klinika uchun navbat, qabul va to'lov jarayonini bitta tizimga bog'laydi.
          Keyingi bosqichda bu modul Payme, Click yoki Uzum Bank kabi to'lov tizimlariga ulanadi.
        </p>
      </section>
    </div>
  );
}

`;

  code = code.slice(0, index) + fn + code.slice(index);
}

// 6) defaultPayments bo'lmasa qo'shamiz
if (!code.includes("const defaultPayments")) {
  code = code.replace(
    "const defaultHistory = [",
    `const defaultPayments = defaultAppointments.map((item) => ({
  id: item.id,
  patient: item.patient,
  patientId: item.patientId,
  clinic: item.clinic,
  service: \`\${item.spec} qabul\`,
  amount: item.price,
  status: "Kutilmoqda",
  time: item.time,
}));

const defaultHistory = [`
  );
}

// 7) Navbat olganda payment ham yaratilishini tekshiramiz
if (!code.includes("const newPayment = {")) {
  code = code.replace(
    '    setAppointments([newAppointment, ...appointments]);\n    setActiveTab("home");',
    `    const newPayment = {
      id: newAppointment.id,
      patient: newAppointment.patient,
      patientId: newAppointment.patientId,
      clinic: newAppointment.clinic,
      service: \`\${newAppointment.spec} qabul\`,
      amount: newAppointment.price,
      status: "Kutilmoqda",
      time: newAppointment.time,
    };

    setAppointments([newAppointment, ...appointments]);
    setPayments((items) => [newPayment, ...items]);
    setActiveTab("home");`
  );
}

fs.writeFileSync(appPath, code, "utf8");
console.log("To'lovlar sahifasi render va props bilan to'g'rilandi.");