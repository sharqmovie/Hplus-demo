import { useEffect, useMemo, useState } from "react";
import "./App.css";

const patient = {
  name: "Azizbek Karimov",
  id: "HP-24019",
  age: 28,
  phone: "+998 90 123 45 67",
  blood: "O+",
  allergy: "Penitsillin",
  chronic: "Yengil allergik rinit",
  emergencyContact: "+998 91 777 12 12",
};

const demoPatients = [
  { id: "HP-24019", name: "Azizbek Karimov", phone: "+998 90 123 45 67", lastVisit: "Bugun", risk: "Past" },
  { id: "HP-24031", name: "Malika Sobirova", phone: "+998 93 222 11 44", lastVisit: "Kecha", risk: "O‘rta" },
  { id: "HP-24044", name: "Javohir Saidov", phone: "+998 95 909 10 10", lastVisit: "12.06.2026", risk: "Yuqori" },
];

const clinics = [
  {
    id: 1,
    name: "MedLine Clinic",
    distance: "1.2 km",
    rating: "4.8",
    address: "Yunusobod, Toshkent",
    doctors: [
      { id: 1, name: "Dr. Dilshod Rahimov", spec: "Terapevt", price: "80 000 so‘m" },
      { id: 2, name: "Dr. Madina Aliyeva", spec: "Kardiolog", price: "120 000 so‘m" },
    ],
  },
  {
    id: 2,
    name: "Shifo Plus",
    distance: "2.5 km",
    rating: "4.6",
    address: "Chilonzor, Toshkent",
    doctors: [
      { id: 3, name: "Dr. Jasur Toirov", spec: "Nevrolog", price: "110 000 so‘m" },
      { id: 4, name: "Dr. Sevara Ergasheva", spec: "Pediatr", price: "90 000 so‘m" },
    ],
  },
];

const defaultAppointments = [
  {
    id: 1,
    patient: patient.name,
    patientId: patient.id,
    clinic: "MedLine Clinic",
    doctor: "Dr. Dilshod Rahimov",
    spec: "Terapevt",
    time: "Bugun, 15:30",
    status: "Tasdiqlangan",
    price: "80 000 so‘m",
  },
];

const defaultPayments = defaultAppointments.map((item) => ({
  id: item.id,
  patient: item.patient,
  patientId: item.patientId,
  clinic: item.clinic,
  service: `${item.spec} qabul`,
  amount: item.price,
  status: "Kutilmoqda",
  time: item.time,
}));

const defaultHistory = [
  {
    date: "12.06.2026",
    clinic: "MedLine Clinic",
    doctor: "Dr. Dilshod Rahimov",
    diagnosis: "Shamollash",
    advice: "Ko‘p suyuqlik ichish, 3 kun dam olish, haroratni nazorat qilish.",
  },
  {
    date: "24.05.2026",
    clinic: "Shifo Plus",
    doctor: "Dr. Jasur Toirov",
    diagnosis: "Bosh og‘rig‘i",
    advice: "Uyqu rejimini tartibga keltirish va stressni kamaytirish.",
  },
];

const timeSlots = ["09:30", "10:40", "12:00", "14:30", "16:10"];
const appTarget = import.meta.env.VITE_APP_TARGET === "clinic" ? "clinic" : "patient";

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function useStoredState(key, fallback) {
  const [state, setState] = useState(() => readStorage(key, fallback));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== key || !event.newValue) return;

      try {
        const parsed = JSON.parse(event.newValue);
        if (Array.isArray(parsed)) {
          setState(parsed);
        }
      } catch {
        // localStorage xatosi demo ishini to‘xtatmasligi uchun bo‘sh qoldirildi
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  return [state, setState];
}

function App() {
  const path = window.location.pathname.toLowerCase();
  const isClinicPage = appTarget === "clinic" || path.startsWith("/clinic");

  useEffect(() => {
    if (window.location.pathname === "/" || window.location.pathname === "") {
      window.history.replaceState({}, "", appTarget === "clinic" ? "/clinic" : "/patient");
    }
  }, []);

  const [activeTab, setActiveTab] = useState("home");
  const [adminTab, setAdminTab] = useState("dashboard");

  const [selectedClinicId, setSelectedClinicId] = useState(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState(1);
  const [selectedTime, setSelectedTime] = useState("10:40");

  const [appointments, setAppointments] = useStoredState("hplus-demo-appointments", defaultAppointments);
  const [history, setHistory] = useStoredState("hplus-demo-history", defaultHistory);
  const [payments, setPayments] = useStoredState("hplus-demo-payments", defaultPayments);

  const [symptoms, setSymptoms] = useState("");
  const [aiResult, setAiResult] = useState(null);

  const selectedClinic = useMemo(() => {
    return clinics.find((clinic) => clinic.id === Number(selectedClinicId)) || clinics[0];
  }, [selectedClinicId]);

  const selectedDoctor = useMemo(() => {
    return selectedClinic.doctors.find((doctor) => doctor.id === Number(selectedDoctorId)) || selectedClinic.doctors[0];
  }, [selectedClinic, selectedDoctorId]);

  function handleClinicChange(event) {
    const clinicId = Number(event.target.value);
    const clinic = clinics.find((item) => item.id === clinicId) || clinics[0];
    setSelectedClinicId(clinicId);
    setSelectedDoctorId(clinic.doctors[0].id);
  }

  function bookAppointment() {
    const newAppointment = {
      id: Date.now(),
      patient: patient.name,
      patientId: patient.id,
      clinic: selectedClinic.name,
      doctor: selectedDoctor.name,
      spec: selectedDoctor.spec,
      time: `Bugun, ${selectedTime}`,
      status: "Yangi navbat",
      price: selectedDoctor.price,
    };

    const newPayment = {
      id: newAppointment.id,
      patient: newAppointment.patient,
      patientId: newAppointment.patientId,
      clinic: newAppointment.clinic,
      service: `${newAppointment.spec} qabul`,
      amount: newAppointment.price,
      status: "Kutilmoqda",
      time: newAppointment.time,
    };

    setAppointments([newAppointment, ...appointments]);
    setPayments((items) => [newPayment, ...items]);
    setActiveTab("home");
  }

  function updateAppointmentStatus(id, status) {
    setAppointments((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item))
    );
  }

  function runAiCheck() {
    const text = symptoms.toLowerCase();

    if (!text.trim()) {
      setAiResult({
        level: "Ma’lumot kerak",
        title: "Simptom yozilmadi",
        text: "Iltimos, o‘zingizni qanday his qilayotganingizni qisqa yozing.",
        doctor: "Terapevt",
      });
      return;
    }

    if (text.includes("ko‘krak") || text.includes("kokrak") || text.includes("nafas") || text.includes("hush")) {
      setAiResult({
        level: "Yuqori xavf",
        title: "Shoshilinch tekshiruv kerak bo‘lishi mumkin",
        text: "Ko‘krak og‘rig‘i, nafas qisishi yoki hushdan ketish holatlari jiddiy bo‘lishi mumkin. Tez yordam yoki yaqin klinikaga murojaat qiling.",
        doctor: "Kardiolog / Tez yordam",
      });
      return;
    }

    if (text.includes("isitma") || text.includes("harorat") || text.includes("yo‘tal") || text.includes("yotal")) {
      setAiResult({
        level: "O‘rta xavf",
        title: "Infeksiya yoki shamollash belgisi bo‘lishi mumkin",
        text: "Harorat, yo‘tal va holsizlik kuzatilsa, terapevt ko‘rigiga yozilish tavsiya etiladi. Suv iching va haroratni nazorat qiling.",
        doctor: "Terapevt",
      });
      return;
    }

    setAiResult({
      level: "Past xavf",
      title: "Rejali ko‘rik tavsiya etiladi",
      text: "Belgilar hozircha jiddiy xavfga o‘xshamaydi, ammo davom etsa shifokor bilan maslahat qiling.",
      doctor: "Oilaviy shifokor / Terapevt",
    });
  }

  function resetDemoData() {
    window.localStorage.removeItem("hplus-demo-appointments");
    window.localStorage.removeItem("hplus-demo-history");
    window.localStorage.removeItem("hplus-demo-payments");
    window.location.reload();
  }

  function finishDemoVisit() {
    const firstAppointment = appointments[0];

    const newRecord = {
      date: "Bugun",
      clinic: firstAppointment?.clinic || "MedLine Clinic",
      doctor: firstAppointment?.doctor || "Dr. Dilshod Rahimov",
      diagnosis: "Demo qabul yakunlandi",
      advice: "Bemor holati tekshirildi. 3 kundan keyin qayta nazorat tavsiya qilindi.",
    };

    setHistory([newRecord, ...history]);

    if (firstAppointment?.id) {
      updateAppointmentStatus(firstAppointment.id, "Yakunlandi");
    }

    setActiveTab("history");
  }

  if (isClinicPage) {
    return (
      <main className="page">
        <section className="desktopPanel">
          <ClinicAdmin
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            appointments={appointments}
            patients={demoPatients}
            updateAppointmentStatus={updateAppointmentStatus}
            patient={patient}
            setHistory={setHistory}
            payments={payments}
            setPayments={setPayments}
            resetDemoData={resetDemoData}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="phone">
        <Header />

        <div className="content">
          {activeTab === "home" && (
            <Home
              patient={patient}
              appointments={appointments}
              setActiveTab={setActiveTab}
              finishDemoVisit={finishDemoVisit}
            />
          )}

          {activeTab === "queue" && (
            <Queue
              clinics={clinics}
              selectedClinicId={selectedClinicId}
              selectedDoctorId={selectedDoctorId}
              selectedTime={selectedTime}
              selectedClinic={selectedClinic}
              selectedDoctor={selectedDoctor}
              onClinicChange={handleClinicChange}
              setSelectedDoctorId={setSelectedDoctorId}
              setSelectedTime={setSelectedTime}
              bookAppointment={bookAppointment}
            />
          )}

          {activeTab === "card" && <MedicalCard patient={patient} />}

          {activeTab === "history" && <History history={history} />}

          {activeTab === "ai" && (
            <AiAssistant
              symptoms={symptoms}
              setSymptoms={setSymptoms}
              aiResult={aiResult}
              runAiCheck={runAiCheck}
            />
          )}

          {activeTab === "payments" && <PatientPayments payments={payments} setPayments={setPayments} />}

          {activeTab === "emergency" && <EmergencyCard patient={patient} />}
        </div>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </section>
    </main>
  );
}

function Header() {
  return (
    <header className="header">
      <div>
        <p className="eyebrow">H+ Patient</p>
        <h1>Raqamli tibbiy karta</h1>
      </div>
      <div className="avatar">H+</div>
    </header>
  );
}

function Home({ patient, appointments, setActiveTab, finishDemoVisit, payments = [] }) {
  const next = appointments[0] || {
    time: "Navbat yo‘q",
    doctor: "Shifokor tanlanmagan",
    spec: "Navbat oling",
    status: "Bo‘sh",
  };

  return (
    <div className="screen">
      <section className="hero">
        <div>
          <p className="muted">Salom,</p>
          <h2>{patient.name}</h2>
          <p className="id">H+ ID: {patient.id}</p>
        </div>
        <div className="pulse">
          <span>98%</span>
          <small>Health</small>
        </div>
      </section>

      <section className="card accent">
        <div>
          <p className="label">Bugungi navbat</p>
          <h3>{next.time}</h3>
          <p>{next.doctor} · {next.spec}</p>
          <span className="badge">{next.status}</span>
        </div>
      </section>

      <div className="quickGrid">
        <button onClick={() => setActiveTab("queue")}>Navbat olish</button>
        <button onClick={() => setActiveTab("card")}>Tibbiy karta</button>
        <button onClick={() => setActiveTab("ai")}>AI yordamchi</button>
        <button onClick={() => setActiveTab("emergency")}>Emergency</button>
      </div>

      {payments.some((item) => item.status !== "To'landi") && (
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
      </section>

      <section className="card">
        <p className="label">Demo oqim</p>
        <h3>Shifokor qabulini yakunlash</h3>
        <p>Bu tugma bosilganda bemorning kasallik tarixiga yangi yozuv qo‘shiladi.</p>
        <button className="primary" onClick={finishDemoVisit}>Qabulni yakunlash</button>
      </section>
    </div>
  );
}

function Queue({
  clinics,
  selectedClinicId,
  selectedDoctorId,
  selectedTime,
  selectedClinic,
  selectedDoctor,
  onClinicChange,
  setSelectedDoctorId,
  setSelectedTime,
  bookAppointment,
}) {
  return (
    <div className="screen">
      <div className="titleBlock">
        <p className="eyebrow">Online queue</p>
        <h2>Navbat olish</h2>
        <p>Yaqin klinika, shifokor va vaqtni tanlang.</p>
      </div>

      <section className="card formCard">
        <label>Klinika</label>
        <select value={selectedClinicId} onChange={onClinicChange}>
          {clinics.map((clinic) => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.name} · {clinic.distance}
            </option>
          ))}
        </select>

        <label>Shifokor</label>
        <select value={selectedDoctorId} onChange={(event) => setSelectedDoctorId(Number(event.target.value))}>
          {selectedClinic.doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} · {doctor.spec}
            </option>
          ))}
        </select>

        <label>Vaqt</label>
        <div className="slots">
          {timeSlots.map((time) => (
            <button
              key={time}
              className={selectedTime === time ? "slot active" : "slot"}
              onClick={() => setSelectedTime(time)}
            >
              {time}
            </button>
          ))}
        </div>
      </section>

      <section className="card summary">
        <p className="label">Tanlangan navbat</p>
        <h3>{selectedDoctor.name}</h3>
        <p>{selectedDoctor.spec} · {selectedDoctor.price}</p>
        <p>{selectedClinic.name} · {selectedClinic.address}</p>
        <button className="primary" onClick={bookAppointment}>Navbatni tasdiqlash</button>
      </section>
    </div>
  );
}

function MedicalCard({ patient }) {
  return (
    <div className="screen">
      <div className="titleBlock">
        <p className="eyebrow">Medical profile</p>
        <h2>Mening kartam</h2>
        <p>Bemorning yagona raqamli tibbiy profili.</p>
      </div>

      <section className="card profile">
        <div className="bigAvatar">AK</div>
        <h3>{patient.name}</h3>
        <p>{patient.id}</p>
      </section>

      <div className="infoGrid">
        <Info label="Yosh" value={`${patient.age} yosh`} />
        <Info label="Telefon" value={patient.phone} />
        <Info label="Qon guruhi" value={patient.blood} />
        <Info label="Allergiya" value={patient.allergy} />
        <Info label="Surunkali holat" value={patient.chronic} />
        <Info label="Yaqin odam" value={patient.emergencyContact} />
      </div>
    </div>
  );
}

function History({ history }) {
  return (
    <div className="screen">
      <div className="titleBlock">
        <p className="eyebrow">Health history</p>
        <h2>Kasallik tarixi</h2>
        <p>Oldingi qabul, tashxis va shifokor tavsiyalari.</p>
      </div>

      <div className="timeline">
        {history.map((item, index) => (
          <section className="card historyCard" key={`${item.date}-${index}`}>
            <span className="date">{item.date}</span>
            <h3>{item.diagnosis}</h3>
            <p>{item.clinic} · {item.doctor}</p>
            <p>{item.advice}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

function AiAssistant({ symptoms, setSymptoms, aiResult, runAiCheck }) {
  return (
    <div className="screen">
      <div className="titleBlock">
        <p className="eyebrow">AI assistant</p>
        <h2>AI yordamchi</h2>
        <p>Simptomlarni yozing, tizim dastlabki tavsiya beradi.</p>
      </div>

      <section className="card formCard">
        <label>Simptomlar</label>
        <textarea
          value={symptoms}
          onChange={(event) => setSymptoms(event.target.value)}
          placeholder="Masalan: boshim og‘riyapti, isitmam bor, holsizman..."
        />
        <button className="primary" onClick={runAiCheck}>AI tekshiruv</button>
      </section>

      {aiResult && (
        <section className="card aiResult">
          <span className="risk">{aiResult.level}</span>
          <h3>{aiResult.title}</h3>
          <p>{aiResult.text}</p>
          <div className="doctorBox">
            Tavsiya etilgan yo‘nalish: <b>{aiResult.doctor}</b>
          </div>
        </section>
      )}

      <p className="disclaimer">
        Bu demo AI tibbiy tashxis emas. Yakuniy qaror faqat shifokor tomonidan beriladi.
      </p>
    </div>
  );
}

function PatientPayments({ payments = [], setPayments }) {
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

function EmergencyCard({ patient }) {
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

function ClinicAdmin({ adminTab, setAdminTab, appointments, patients, updateAppointmentStatus, patient, setHistory, history = [], payments = [], setPayments, resetDemoData }) {
  return (
    <div className="adminLayout">
      <aside className="adminSidebar">
        <div className="adminBrand">
          <div className="avatar">H+</div>
          <div>
            <h2>H+ Clinic</h2>
            <p>MedLine Admin</p>
          </div>
        </div>

        <nav className="adminMenu">
          <button className={adminTab === "dashboard" ? "active" : ""} onClick={() => setAdminTab("dashboard")}>Dashboard</button>
          <button className={adminTab === "queue" ? "active" : ""} onClick={() => setAdminTab("queue")}>Navbatlar</button>
          <button className={adminTab === "patients" ? "active" : ""} onClick={() => setAdminTab("patients")}>Bemorlar</button>
          <button className={adminTab === "doctors" ? "active" : ""} onClick={() => setAdminTab("doctors")}>Shifokorlar</button>
          <button className={adminTab === "payments" ? "active" : ""} onClick={() => setAdminTab("payments")}>To'lovlar</button>
          <button className={adminTab === "reports" ? "active" : ""} onClick={() => setAdminTab("reports")}>Hisobot</button>
        </nav>
      </aside>

      <section className="adminMain">
        {adminTab === "dashboard" && <AdminDashboard appointments={appointments} resetDemoData={resetDemoData} />}
        {adminTab === "queue" && (
          <AdminQueue
            appointments={appointments}
            updateAppointmentStatus={updateAppointmentStatus}
            patient={patient}
            setHistory={setHistory}
          />
        )}
        {adminTab === "patients" && (
          <AdminPatients
            patients={patients}
            patient={patient}
            history={history}
            payments={payments}
          />
        )}
        {adminTab === "doctors" && <AdminDoctors appointments={appointments} />}
        {adminTab === "payments" && <AdminPayments payments={payments} setPayments={setPayments} />}
        {adminTab === "reports" && <AdminReports appointments={appointments} payments={payments} />}
      </section>
    </div>
  );
}

function AdminDashboard({ appointments, resetDemoData }) {
  const waiting = appointments.filter((item) => item.status !== "Yakunlandi").length;
  const completed = appointments.filter((item) => item.status === "Yakunlandi").length;

  return (
    <div className="adminScreen">
      <AdminTitle title="Klinika dashboard" text="Bugungi navbatlar, qabul va moliyaviy ko‘rsatkichlar." />

      <div className="statsGrid">
        <AdminStat label="Bugungi navbatlar" value={appointments.length} />
        <AdminStat label="Kutayotganlar" value={waiting} />
        <AdminStat label="Yakunlangan" value={completed} />
        <AdminStat label="Kunlik tushum" value="1 420 000" suffix="so‘m" />
      </div>

      <section className="adminCard demoControlCard">
        <div>
          <h3>Demo boshqaruvi</h3>
          <p>Demo boshlashdan oldin eski navbatlar, to'lovlar va tarixni tozalab, tizimni boshlang'ich holatga qaytaring.</p>
        </div>
        <button onClick={resetDemoData}>Demo holatini tozalash</button>
      </section>

      <section className="adminCard">
        <h3>So‘nggi navbatlar</h3>
        <div className="adminList">
          {appointments.slice(0, 4).map((item) => (
            <div className="adminListItem" key={item.id}>
              <div>
                <b>{item.patient}</b>
                <p>{item.time} · {item.doctor}</p>
              </div>
              <span>{item.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminQueue({ appointments, updateAppointmentStatus, patient, setHistory }) {
  const [selectedId, setSelectedId] = useState(appointments[0]?.id || null);
  const [diagnosis, setDiagnosis] = useState("Yengil shamollash va holsizlik");
  const [advice, setAdvice] = useState("3 kun dam olish, ko‘p suyuqlik ichish, haroratni nazorat qilish.");

  const selectedAppointment =
    appointments.find((item) => item.id === selectedId) || appointments[0];

  function openAppointment(item) {
    setSelectedId(item.id);
    updateAppointmentStatus(item.id, "Qabulda");
  }

  function saveDoctorRecord() {
    if (!selectedAppointment) return;

    const newRecord = {
      date: "Bugun",
      clinic: selectedAppointment.clinic,
      doctor: selectedAppointment.doctor,
      diagnosis: diagnosis.trim() || "Shifokor ko‘rigi",
      advice: advice.trim() || "Bemor holati tekshirildi. Qayta nazorat tavsiya qilindi.",
    };

    setHistory((items) => [newRecord, ...items]);
    updateAppointmentStatus(selectedAppointment.id, "Yakunlandi");
    alert("Qabul yakunlandi. Yozuv bemorning kasallik tarixiga qo‘shildi.");
  }

  return (
    <div className="adminScreen">
      <AdminTitle
        title="Navbatlar ro‘yxati"
        text="Bemor navbat olganda shu yerda ko‘rinadi. Shifokor kartani ochib qabul natijasini yozadi."
      />

      <section className="adminCard">
        <div className="table">
          <div className="tableHead">
            <span>Bemor</span>
            <span>Shifokor</span>
            <span>Vaqt</span>
            <span>Status</span>
            <span>Amal</span>
          </div>

          {appointments.map((item) => (
            <div className="tableRow" key={item.id}>
              <span>
                <b>{item.patient}</b>
                <small>{item.patientId}</small>
              </span>

              <span>
                <b>{item.doctor}</b>
                <small>{item.spec}</small>
              </span>

              <span>{item.time}</span>

              <span className="statusPill">{item.status}</span>

              <span className="actions">
                <button onClick={() => openAppointment(item)}>Kartani ochish</button>
                <button onClick={() => updateAppointmentStatus(item.id, "Qabulda")}>Qabulda</button>
                <button onClick={() => updateAppointmentStatus(item.id, "Yakunlandi")}>Yakunlash</button>
              </span>
            </div>
          ))}
        </div>
      </section>

      {selectedAppointment && (
        <section className="doctorVisit">
          <div className="doctorPanel">
            <div className="doctorHeader">
              <div>
                <p className="eyebrow">Doctor workspace</p>
                <h2>Shifokor qabul oynasi</h2>
                <p>{selectedAppointment.time} · {selectedAppointment.clinic}</p>
              </div>

              <span className="statusPill">{selectedAppointment.status}</span>
            </div>

            <div className="doctorGrid">
              <div className="doctorPatientCard">
                <div className="bigAvatar">AK</div>
                <h3>{patient.name}</h3>
                <p>{patient.id}</p>

                <div className="doctorInfoList">
                  <Info label="Telefon" value={patient.phone} />
                  <Info label="Yosh" value={`${patient.age} yosh`} />
                  <Info label="Qon guruhi" value={patient.blood} />
                  <Info label="Allergiya" value={patient.allergy} />
                  <Info label="Surunkali holat" value={patient.chronic} />
                  <Info label="Emergency contact" value={patient.emergencyContact} />
                </div>
              </div>

              <div className="doctorForm">
                <div className="doctorAlert">
                  <b>H+ AI signal:</b>
                  <span>Bemor kartasida allergiya bor. Dori yozishda penitsillin guruhiga ehtiyot bo‘ling.</span>
                </div>

                <label>Tashxis</label>
                <textarea
                  value={diagnosis}
                  onChange={(event) => setDiagnosis(event.target.value)}
                  placeholder="Tashxisni yozing..."
                />

                <label>Shifokor tavsiyasi</label>
                <textarea
                  value={advice}
                  onChange={(event) => setAdvice(event.target.value)}
                  placeholder="Tavsiya va retseptni yozing..."
                />

                <button className="primary" onClick={saveDoctorRecord}>
                  Qabulni yakunlash va tarixga yozish
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
function AdminPatients({ patients, patient, history = [], payments = [] }) {
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
  const fallbackHistory = [
    {
      date: "Bugun",
      clinic: "MedLine Clinic",
      doctor: "Dr. Dilshod Rahimov",
      diagnosis: "Terapevt ko'rigi",
      advice: "Bemor holati tekshirildi. 3 kundan keyin qayta nazorat tavsiya qilindi.",
    },
    {
      date: "12.06.2026",
      clinic: "MedLine Clinic",
      doctor: "Dr. Dilshod Rahimov",
      diagnosis: "Shamollash",
      advice: "Ko'p suyuqlik ichish, dam olish va haroratni nazorat qilish tavsiya qilindi.",
    },
  ];

  const patientHistory = isMainPatient
    ? (history.length > 0 ? history : fallbackHistory)
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

function AdminDoctors({ appointments = [] }) {
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

function AdminPayments({ payments, setPayments }) {
  function parseAmount(value) {
    const digits = String(value).replace(/\D/g, "");
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

function AdminReports({ appointments = [], payments = [] }) {
  function parseAmount(value) {
    const digits = String(value).replace(/\D/g, "");
    return Number(digits || 0);
  }

  const totalRevenue = payments.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const paidRevenue = payments
    .filter((item) => item.status === "To'landi")
    .reduce((sum, item) => sum + parseAmount(item.amount), 0);

  const waitingRevenue = totalRevenue - paidRevenue;
  const completedVisits = appointments.filter((item) => item.status === "Yakunlandi").length;
  const activeVisits = appointments.filter((item) => item.status !== "Yakunlandi").length;

  const conversion = payments.length > 0
    ? Math.round((payments.filter((item) => item.status === "To'landi").length / payments.length) * 100)
    : 0;

  const weeklyData = [
    { day: "Du", value: 54 },
    { day: "Se", value: 68 },
    { day: "Ch", value: 82 },
    { day: "Pa", value: 74 },
    { day: "Ju", value: 96 },
    { day: "Sh", value: 60 },
    { day: "Ya", value: 38 },
  ];

  const departments = [
    { name: "Terapevt", percent: 42 },
    { name: "Kardiolog", percent: 28 },
    { name: "Nevrolog", percent: 18 },
    { name: "Pediatr", percent: 12 },
  ];

  return (
    <div className="adminScreen">
      <AdminTitle
        title="Hisobotlar va analitika"
        text="Klinika faoliyati, navbatlar, to'lovlar va shifokor yuklamasi bo'yicha demo tahlil."
      />

      <div className="statsGrid">
        <AdminStat label="Bugungi navbatlar" value={appointments.length} />
        <AdminStat label="Yakunlangan qabul" value={completedVisits} />
        <AdminStat label="Faol navbatlar" value={activeVisits} />
        <AdminStat label="To'lov konversiyasi" value={conversion} suffix="%" />
      </div>

      <section className="reportHero">
        <div>
          <p className="eyebrow">Financial overview</p>
          <h2>{totalRevenue.toLocaleString("ru-RU")} so'm</h2>
          <p>Bugungi umumiy hisoblangan tushum.</p>
        </div>

        <div className="reportHeroGrid">
          <div>
            <span>To'langan</span>
            <b>{paidRevenue.toLocaleString("ru-RU")} so'm</b>
          </div>
          <div>
            <span>Kutilmoqda</span>
            <b>{waitingRevenue.toLocaleString("ru-RU")} so'm</b>
          </div>
        </div>
      </section>

      <div className="analyticsGrid">
        <section className="adminCard">
          <div className="reportCardTitle">
            <div>
              <h3>Haftalik navbatlar</h3>
              <p>Kunlar bo'yicha qabul faolligi.</p>
            </div>
          </div>

          <div className="modernBars">
            {weeklyData.map((item) => (
              <div className="modernBarItem" key={item.day}>
                <div>
                  <i style={{ height: item.value + "%" }} />
                </div>
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="adminCard">
          <div className="reportCardTitle">
            <div>
              <h3>Yo'nalishlar kesimi</h3>
              <p>Eng ko'p murojaat qilingan bo'limlar.</p>
            </div>
          </div>

          <div className="departmentList">
            {departments.map((item) => (
              <div className="departmentItem" key={item.name}>
                <div className="departmentTop">
                  <b>{item.name}</b>
                  <span>{item.percent}%</span>
                </div>
                <div className="departmentBar">
                  <i style={{ width: item.percent + "%" }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="analyticsGrid bottomReports">
        <section className="adminCard">
          <h3>H+ AI xulosa</h3>

          <div className="aiInsightList">
            <div>
              <b>Navbatlar</b>
              <p>Bugungi navbatlar hajmi me'yorda. Terapevt yo'nalishida yuklama yuqoriroq.</p>
            </div>

            <div>
              <b>Moliyaviy holat</b>
              <p>To'langan va kutilayotgan to'lovlar alohida nazorat qilinmoqda.</p>
            </div>

            <div>
              <b>Operatsion tavsiya</b>
              <p>16:00 dan keyin terapevt qabuliga qo'shimcha vaqt ajratish tavsiya etiladi.</p>
            </div>
          </div>
        </section>

        <section className="adminCard">
          <h3>Bugungi klinika xulosasi</h3>

          <div className="summaryRows">
            <div>
              <span>Eng faol shifokor</span>
              <b>Dr. Dilshod Rahimov</b>
            </div>

            <div>
              <span>Eng ko'p yo'nalish</span>
              <b>Terapevt</b>
            </div>

            <div>
              <span>O'rtacha kutish</span>
              <b>12 daqiqa</b>
            </div>

            <div>
              <span>Bemor qoniqishi</span>
              <b>94%</b>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminTitle({ title, text }) {
  return (
    <div className="adminTitle">
      <p className="eyebrow">H+ clinic platform</p>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}

function AdminStat({ label, value, suffix }) {
  return (
    <section className="adminStat">
      <p>{label}</p>
      <h2>{value}</h2>
      {suffix && <span>{suffix}</span>}
    </section>
  );
}

function Bar({ label, value }) {
  return (
    <div className="barItem">
      <span>{label}</span>
      <div>
        <i style={{ height: value }} />
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  const items = [
    { id: "home", label: "Bosh" },
    { id: "queue", label: "Navbat" },
    { id: "card", label: "Karta" },
    { id: "history", label: "Tarix" },
    { id: "ai", label: "AI" },
    { id: "payments", label: "To'lov" },
    { id: "emergency", label: "SOS" },
  ];

  return (
    <nav className="bottomNav">
      {items.map((item) => (
        <button
          key={item.id}
          className={activeTab === item.id ? "active" : ""}
          onClick={() => setActiveTab(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default App;
