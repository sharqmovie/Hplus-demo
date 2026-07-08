const fs = require("fs");
const path = require("path");

const appPath = path.join(process.cwd(), "src", "App.jsx");
let code = fs.readFileSync(appPath, "utf8");

// 1) resetDemo funksiyasini App ichiga qo'shamiz
if (!code.includes("function resetDemoData()")) {
  const marker = `  function finishDemoVisit() {`;

  const resetFn = `  function resetDemoData() {
    window.localStorage.removeItem("hplus-demo-appointments");
    window.localStorage.removeItem("hplus-demo-history");
    window.localStorage.removeItem("hplus-demo-payments");
    window.location.reload();
  }

`;

  code = code.replace(marker, resetFn + marker);
}

// 2) ClinicAdmin ga resetDemoData yuboramiz
if (!code.includes("resetDemoData={resetDemoData}")) {
  code = code.replace(
    `            setPayments={setPayments}
          />`,
    `            setPayments={setPayments}
            resetDemoData={resetDemoData}
          />`
  );
}

// 3) ClinicAdmin props ichiga resetDemoData qo'shamiz
code = code.replace(
  /function ClinicAdmin\(\{ adminTab, setAdminTab, appointments, patients, updateAppointmentStatus, patient, setHistory, history = \[\], payments = \[\], setPayments(?:, resetDemoData)? \}\) \{/,
  `function ClinicAdmin({ adminTab, setAdminTab, appointments, patients, updateAppointmentStatus, patient, setHistory, history = [], payments = [], setPayments, resetDemoData }) {`
);

// 4) AdminDashboard ga resetDemoData beramiz
code = code.replace(
  `{adminTab === "dashboard" && <AdminDashboard appointments={appointments} />}`,
  `{adminTab === "dashboard" && <AdminDashboard appointments={appointments} resetDemoData={resetDemoData} />}`
);

// 5) AdminDashboard propsini yangilaymiz
code = code.replace(
  `function AdminDashboard({ appointments }) {`,
  `function AdminDashboard({ appointments, resetDemoData }) {`
);

// 6) Dashboard ichiga reset tugma qo'shamiz
if (!code.includes("Demo holatini tozalash")) {
  code = code.replace(
    `      <section className="adminCard">
        <h3>So‘nggi navbatlar</h3>`,
    `      <section className="adminCard demoControlCard">
        <div>
          <h3>Demo boshqaruvi</h3>
          <p>Demo boshlashdan oldin eski navbatlar, to'lovlar va tarixni tozalab, tizimni boshlang'ich holatga qaytaring.</p>
        </div>
        <button onClick={resetDemoData}>Demo holatini tozalash</button>
      </section>

      <section className="adminCard">
        <h3>So‘nggi navbatlar</h3>`
  );
}

fs.writeFileSync(appPath, code, "utf8");
console.log("Dashboardga demo reset tugmasi qo'shildi.");