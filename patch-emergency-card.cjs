const fs = require("fs");
const path = require("path");

const appPath = path.join(process.cwd(), "src", "App.jsx");
let code = fs.readFileSync(appPath, "utf8");

const start = code.indexOf("function EmergencyCard");
const end = code.indexOf("function ClinicAdmin", start);

if (start === -1 || end === -1) {
  throw new Error("EmergencyCard yoki ClinicAdmin topilmadi.");
}

const newEmergencyCard = `function EmergencyCard({ patient }) {
  return (
    <div className="screen">
      <section className="emergencyPremium">
        <div className="emergencyHeaderLine">
          <div>
            <p>H+ Emergency ID</p>
            <h2>{patient.name}</h2>
            <span>{patient.id}</span>
          </div>

          <div className="qrBox" aria-label="Demo QR code">
            {Array.from({ length: 49 }).map((_, index) => (
              <i key={index} className={index % 3 === 0 || index % 7 === 0 || index === 22 ? "on" : ""} />
            ))}
          </div>
        </div>

        <div className="emergencyStatus">
          <b>Favqulodda holat kartasi</b>
          <span>Shifokor uchun tezkor ma'lumot</span>
        </div>
      </section>

      <section className="card danger emergencyGridCard">
        <h3>Tez yordam uchun muhim ma'lumotlar</h3>

        <div className="emergencyInfoGrid">
          <Info label="Qon guruhi" value={patient.blood} />
          <Info label="Allergiya" value={patient.allergy} />
          <Info label="Surunkali holat" value={patient.chronic} />
          <Info label="Yaqin odam" value={patient.emergencyContact} />
        </div>
      </section>

      <section className="card">
        <p className="label">Oxirgi tibbiy yozuv</p>
        <h3>Shamollash / holsizlik</h3>
        <p>Shifokor: Dr. Dilshod Rahimov. Haroratni nazorat qilish tavsiya qilingan.</p>

        <div className="warningList">
          <div>
            <b>Dori ogohlantirish</b>
            <span>Penitsillin guruhiga allergiya mavjud.</span>
          </div>

          <div>
            <b>Emergency contact</b>
            <span>{patient.emergencyContact}</span>
          </div>
        </div>
      </section>

      <section className="card familyCard">
        <p className="label">Oila profili</p>
        <h3>H+ Family</h3>
        <p>Bemor kelajakda farzandlari yoki ota-onasining tibbiy kartalarini ham shu ilovadan boshqara oladi.</p>

        <div className="familyList">
          <span>Ona: Saodat Karimova</span>
          <span>Farzand: Jasmina Karimova</span>
        </div>
      </section>

      <div className="sosGrid">
        <button className="sos">103 ga qo'ng'iroq qilish</button>
        <button className="ghostSos">Yaqin odamga xabar</button>
      </div>
    </div>
  );
}

`;

code = code.slice(0, start) + newEmergencyCard + code.slice(end);

fs.writeFileSync(appPath, code, "utf8");
console.log("Emergency QR Card yangilandi.");