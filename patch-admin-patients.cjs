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

// 1) ClinicAdmin chaqiruviga history props qo'shamiz
if (!code.includes("history={history}")) {
  replaceOnce(
    `            setHistory={setHistory}
            payments={payments}`,
    `            setHistory={setHistory}
            history={history}
            payments={payments}`,
    "ClinicAdmin ga history props qo'shildi"
  );
}

// 2) ClinicAdmin props ichiga history qo'shamiz
code = code.replace(
  /function ClinicAdmin\(\{ adminTab, setAdminTab, appointments, patients, updateAppointmentStatus, patient, setHistory, payments = \[\], setPayments \}\) \{/,
  `function ClinicAdmin({ adminTab, setAdminTab, appointments, patients, updateAppointmentStatus, patient, setHistory, history = [], payments = [], setPayments }) {`
);

code = code.replace(
  /function ClinicAdmin\(\{ adminTab, setAdminTab, appointments, patients, updateAppointmentStatus, patient, setHistory, payments, setPayments \}\) \{/,
  `function ClinicAdmin({ adminTab, setAdminTab, appointments, patients, updateAppointmentStatus, patient, setHistory, history = [], payments = [], setPayments }) {`
);

// 3) AdminPatients renderini yangilaymiz
replaceOnce(
  `{adminTab === "patients" && <AdminPatients patients={patients} />}`,
  `{adminTab === "patients" && (
          <AdminPatients
            patients={patients}
            patient={patient}
            history={history}
            payments={payments}
          />
        )}`,
  "AdminPatients props bilan yangilandi"
);

// 4) AdminPatients funksiyasini to'liq almashtiramiz
const start = code.indexOf("function AdminPatients");
let end = code.indexOf("function AdminPayments", start);

if (end === -1) {
  end = code.indexOf("function AdminReports", start);
}

if (start === -1 || end === -1) {
  throw new Error("AdminPatients yoki keyingi funksiya topilmadi.");
}

const newAdminPatients = `function AdminPatients({ patients, patient, history = [], payments = [] }) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || patient.id);

  const selected = patients.find((item) => item.id === selectedPatientId) || patients[0];
  const isMainPatient = selected?.id === patient.id;

  const selectedProfile = isMainPatient
    ? {
        name: patient.name,
        id: patient.id,
        phone: patient.phone,
        age: patient.age + " yosh",
        blood: patient.blood,
        allergy: patient.allergy,
        chronic: patient.chronic,
        emergencyContact: patient.emergencyContact,
        risk: selected?.risk || "Past",
        lastVisit: selected?.lastVisit || "Bugun",
      }
    : {
        name: selected?.name || "Bemor",
        id: selected?.id || "HP-00000",
        phone: selected?.phone || "+998",
        age: "Ma'lumot yo'q",
        blood: "Kiritilmagan",
        allergy: "Kiritilmagan",
        chronic: "Kiritilmagan",
        emergencyContact: "Kiritilmagan",
        risk: selected?.risk || "Past",
        lastVisit: selected?.lastVisit || "Ma'lumot yo'q",
      };

  const patientPayments = payments.filter((item) => item.patientId === selectedProfile.id);
  const patientHistory = isMainPatient
    ? history
    : [
        {
          date: selectedProfile.lastVisit,
          clinic: "MedLine Clinic",
          doctor: "Dr. Dilshod Rahimov",
          diagnosis: "Demo tibbiy yozuv",
          advice: "Bemor ma'lumotlari klinika bazasida saqlanmoqda.",
        },
      ];

  return (
    <div className="adminScreen">
      <AdminTitle
        title="Bemorlar bazasi"
        text="Klinikaga kelgan bemorlarning yagona H+ kartalari va tibbiy tarixi."
      />

      <section className="patientWorkspace">
        <div className="patientListPanel">
          <h3>Bemorlar</h3>

          <div className="patientListButtons">
            {patients.map((item) => (
              <button
                key={item.id}
                className={selectedPatientId === item.id ? "active" : ""}
                onClick={() => setSelectedPatientId(item.id)}
              >
                <b>{item.name}</b>
                <span>{item.id} · Risk: {item.risk}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="patientDetailPanel">
          <div className="patientDetailHeader">
            <div>
              <p className="eyebrow">H+ patient card</p>
              <h2>{selectedProfile.name}</h2>
              <span>{selectedProfile.id}</span>
            </div>

            <div className="riskBadge">
              <b>{selectedProfile.risk}</b>
              <small>risk</small>
            </div>
          </div>

          <div className="patientDetailGrid">
            <Info label="Telefon" value={selectedProfile.phone} />
            <Info label="Yosh" value={selectedProfile.age} />
            <Info label="Qon guruhi" value={selectedProfile.blood} />
            <Info label="Allergiya" value={selectedProfile.allergy} />
            <Info label="Surunkali holat" value={selectedProfile.chronic} />
            <Info label="Emergency contact" value={selectedProfile.emergencyContact} />
          </div>

          <div className="patientSections">
            <section className="adminCard innerAdminCard">
              <h3>Kasallik tarixi</h3>

              <div className="compactTimeline">
                {patientHistory.slice(0, 4).map((item, index) => (
                  <div className="compactHistoryItem" key={index}>
                    <span>{item.date}</span>
                    <b>{item.diagnosis}</b>
                    <p>{item.clinic} · {item.doctor}</p>
                    <p>{item.advice}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="adminCard innerAdminCard">
              <h3>To'lov holati</h3>

              {patientPayments.length === 0 ? (
                <p>Bu bemor bo'yicha hozircha to'lov yozuvi yo'q.</p>
              ) : (
                <div className="compactTimeline">
                  {patientPayments.map((item) => (
                    <div className="compactHistoryItem" key={item.id}>
                      <span>{item.status}</span>
                      <b>{item.amount}</b>
                      <p>{item.service} · {item.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

`;

code = code.slice(0, start) + newAdminPatients + code.slice(end);

fs.writeFileSync(appPath, code, "utf8");
console.log("Bemorlar bo'limi professional karta ko'rinishiga o'tkazildi.");