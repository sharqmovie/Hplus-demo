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

if (!code.includes("const defaultPayments")) {
  replaceOnce(
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

const defaultHistory = [`,
    "defaultPayments qo'shildi"
  );
}

if (!code.includes("hplus-demo-payments")) {
  replaceOnce(
    `  const [history, setHistory] = useStoredState("hplus-demo-history", defaultHistory);`,
    `  const [history, setHistory] = useStoredState("hplus-demo-history", defaultHistory);
  const [payments, setPayments] = useStoredState("hplus-demo-payments", defaultPayments);`,
    "payments state qo'shildi"
  );
}

if (!code.includes("const newPayment = {")) {
  replaceOnce(
    `    setAppointments([newAppointment, ...appointments]);
    setActiveTab("home");`,
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
    setActiveTab("home");`,
    "navbat olganda payment yaratish qo'shildi"
  );
}

if (!code.includes("payments={payments}")) {
  replaceOnce(
    `            patient={patient}
            setHistory={setHistory}
          />`,
    `            patient={patient}
            setHistory={setHistory}
            payments={payments}
            setPayments={setPayments}
          />`,
    "ClinicAdmin ga payments props qo'shildi"
  );
}

replaceOnce(
  `function ClinicAdmin({ adminTab, setAdminTab, appointments, patients, updateAppointmentStatus, patient, setHistory }) {`,
  `function ClinicAdmin({ adminTab, setAdminTab, appointments, patients, updateAppointmentStatus, patient, setHistory, payments, setPayments }) {`,
  "ClinicAdmin props yangilandi"
);

if (!code.includes(`setAdminTab("payments")`)) {
  replaceOnce(
    `          <button className={adminTab === "patients" ? "active" : ""} onClick={() => setAdminTab("patients")}>Bemorlar</button>
          <button className={adminTab === "reports" ? "active" : ""} onClick={() => setAdminTab("reports")}>Hisobot</button>`,
    `          <button className={adminTab === "patients" ? "active" : ""} onClick={() => setAdminTab("patients")}>Bemorlar</button>
          <button className={adminTab === "payments" ? "active" : ""} onClick={() => setAdminTab("payments")}>To'lovlar</button>
          <button className={adminTab === "reports" ? "active" : ""} onClick={() => setAdminTab("reports")}>Hisobot</button>`,
    "To'lovlar menyuga qo'shildi"
  );
}

if (!code.includes(`adminTab === "payments"`)) {
  replaceOnce(
    `        {adminTab === "patients" && <AdminPatients patients={patients} />}
        {adminTab === "reports" && <AdminReports appointments={appointments} />}`,
    `        {adminTab === "patients" && <AdminPatients patients={patients} />}
        {adminTab === "payments" && <AdminPayments payments={payments} setPayments={setPayments} />}
        {adminTab === "reports" && <AdminReports appointments={appointments} />}`,
    "AdminPayments render qo'shildi"
  );
}

if (!code.includes("function AdminPayments")) {
  const marker = "function AdminReports";
  const index = code.indexOf(marker);

  if (index === -1) {
    throw new Error("AdminReports funksiyasi topilmadi.");
  }

  const paymentsFunction = `function AdminPayments({ payments, setPayments }) {
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
    setPayments((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: "To'landi" } : item
      )
    );
  }

  function markWaiting(id) {
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

  code = code.slice(0, index) + paymentsFunction + code.slice(index);
  console.log("OK: AdminPayments funksiyasi qo'shildi");
}

fs.writeFileSync(appPath, code, "utf8");
console.log("Tayyor: To'lovlar moduli App.jsx ga yozildi.");