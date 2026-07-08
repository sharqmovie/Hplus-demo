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

// 1) Sidebar menyuga Shifokorlar qo'shamiz
if (!code.includes('setAdminTab("doctors")')) {
  replaceOnce(
    `          <button className={adminTab === "patients" ? "active" : ""} onClick={() => setAdminTab("patients")}>Bemorlar</button>
          <button className={adminTab === "payments" ? "active" : ""} onClick={() => setAdminTab("payments")}>To'lovlar</button>`,
    `          <button className={adminTab === "patients" ? "active" : ""} onClick={() => setAdminTab("patients")}>Bemorlar</button>
          <button className={adminTab === "doctors" ? "active" : ""} onClick={() => setAdminTab("doctors")}>Shifokorlar</button>
          <button className={adminTab === "payments" ? "active" : ""} onClick={() => setAdminTab("payments")}>To'lovlar</button>`,
    "Shifokorlar menyuga qo'shildi"
  );
}

// 2) Render qismiga AdminDoctors qo'shamiz
if (!code.includes('adminTab === "doctors"')) {
  replaceOnce(
    `        {adminTab === "payments" && <AdminPayments payments={payments} setPayments={setPayments} />}`,
    `        {adminTab === "doctors" && <AdminDoctors appointments={appointments} />}
        {adminTab === "payments" && <AdminPayments payments={payments} setPayments={setPayments} />}`,
    "AdminDoctors render qo'shildi"
  );
}

// 3) AdminDoctors funksiyasini qo'shamiz
if (!code.includes("function AdminDoctors")) {
  const marker = "function AdminPayments";
  const index = code.indexOf(marker);

  if (index === -1) {
    throw new Error("AdminPayments funksiyasi topilmadi.");
  }

  const fn = `function AdminDoctors({ appointments = [] }) {
  const doctors = [
    {
      id: "DOC-01",
      name: "Dr. Dilshod Rahimov",
      spec: "Terapevt",
      room: "203",
      status: "Qabulda",
      schedule: "09:00 - 18:00",
      rating: "4.9",
      workload: 82,
      income: "640 000 so'm",
      nextPatient: "Azizbek Karimov",
    },
    {
      id: "DOC-02",
      name: "Dr. Madina Aliyeva",
      spec: "Kardiolog",
      room: "207",
      status: "Bo'sh",
      schedule: "10:00 - 17:00",
      rating: "4.8",
      workload: 56,
      income: "480 000 so'm",
      nextPatient: "Malika Sobirova",
    },
    {
      id: "DOC-03",
      name: "Dr. Jasur Toirov",
      spec: "Nevrolog",
      room: "305",
      status: "Qabulda",
      schedule: "09:30 - 16:30",
      rating: "4.7",
      workload: 68,
      income: "550 000 so'm",
      nextPatient: "Javohir Saidov",
    },
    {
      id: "DOC-04",
      name: "Dr. Sevara Ergasheva",
      spec: "Pediatr",
      room: "112",
      status: "Offline",
      schedule: "12:00 - 20:00",
      rating: "4.9",
      workload: 34,
      income: "300 000 so'm",
      nextPatient: "Navbat yo'q",
    },
  ];

  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0].id);
  const selectedDoctor = doctors.find((item) => item.id === selectedDoctorId) || doctors[0];

  const doctorAppointments = appointments.filter((item) =>
    item.doctor.toLowerCase().includes(selectedDoctor.name.toLowerCase().replace("dr. ", ""))
  );

  const activeDoctors = doctors.filter((item) => item.status !== "Offline").length;
  const averageWorkload = Math.round(
    doctors.reduce((sum, item) => sum + item.workload, 0) / doctors.length
  );

  return (
    <div className="adminScreen">
      <AdminTitle
        title="Shifokorlar / Staff Control"
        text="Klinika xodimlari, qabul yuklamasi, kabinetlar va bugungi ish holati."
      />

      <div className="statsGrid">
        <AdminStat label="Faol shifokorlar" value={activeDoctors} />
        <AdminStat label="Bugungi qabul" value={appointments.length} />
        <AdminStat label="O'rtacha yuklama" value={averageWorkload} suffix="%" />
        <AdminStat label="Kabinetlar" value="4" />
      </div>

      <section className="staffWorkspace">
        <div className="staffListPanel">
          <h3>Shifokorlar</h3>

          <div className="staffList">
            {doctors.map((doctor) => (
              <button
                key={doctor.id}
                className={selectedDoctorId === doctor.id ? "active" : ""}
                onClick={() => setSelectedDoctorId(doctor.id)}
              >
                <div>
                  <b>{doctor.name}</b>
                  <span>{doctor.spec} · Kabinet {doctor.room}</span>
                </div>

                <small>{doctor.status}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="staffDetailPanel">
          <div className="staffHero">
            <div>
              <p className="eyebrow">Doctor profile</p>
              <h2>{selectedDoctor.name}</h2>
              <span>{selectedDoctor.spec} · Kabinet {selectedDoctor.room}</span>
            </div>

            <div className="doctorStatusBox">
              <b>{selectedDoctor.status}</b>
              <small>status</small>
            </div>
          </div>

          <div className="staffInfoGrid">
            <Info label="Ish vaqti" value={selectedDoctor.schedule} />
            <Info label="Reyting" value={selectedDoctor.rating} />
            <Info label="Bugungi tushum" value={selectedDoctor.income} />
            <Info label="Keyingi bemor" value={selectedDoctor.nextPatient} />
          </div>

          <section className="adminCard innerAdminCard">
            <div className="workloadHeader">
              <div>
                <h3>Yuklama</h3>
                <p>Bugungi ish hajmi va qabul zichligi.</p>
              </div>

              <b>{selectedDoctor.workload}%</b>
            </div>

            <div className="workloadBar">
              <i style={{ width: selectedDoctor.workload + "%" }} />
            </div>
          </section>

          <div className="staffSections">
            <section className="adminCard innerAdminCard">
              <h3>Bugungi navbatlar</h3>

              {doctorAppointments.length === 0 ? (
                <div className="staffEmpty">
                  Hozircha bu shifokor uchun yangi navbat yo'q.
                </div>
              ) : (
                <div className="compactTimeline">
                  {doctorAppointments.map((item) => (
                    <div className="compactHistoryItem" key={item.id}>
                      <span>{item.status}</span>
                      <b>{item.patient}</b>
                      <p>{item.time} · {item.spec}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="adminCard innerAdminCard">
              <h3>Staff monitoring</h3>

              <div className="staffSignals">
                <div>
                  <b>Davomat</b>
                  <span>{selectedDoctor.status === "Offline" ? "Hali kelmagan" : "Ish joyida"}</span>
                </div>

                <div>
                  <b>Kabinet</b>
                  <span>{selectedDoctor.room}-xona faol</span>
                </div>

                <div>
                  <b>H+ AI signal</b>
                  <span>Yuklama me'yorda. Navbatlar nazoratda.</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

`;

  code = code.slice(0, index) + fn + code.slice(index);
  console.log("OK: AdminDoctors funksiyasi qo'shildi");
}

fs.writeFileSync(appPath, code, "utf8");
console.log("Tayyor: Shifokorlar / Staff Control qo'shildi.");