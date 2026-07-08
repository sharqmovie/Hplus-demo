const fs = require("fs");
const path = require("path");

const appPath = path.join(process.cwd(), "src", "App.jsx");
let code = fs.readFileSync(appPath, "utf8");

// 1) AdminReports renderiga payments props qo'shamiz
code = code.replace(
  '{adminTab === "reports" && <AdminReports appointments={appointments} />}',
  '{adminTab === "reports" && <AdminReports appointments={appointments} payments={payments} />}'
);

// 2) AdminReports funksiyasini to'liq yangilaymiz
const start = code.indexOf("function AdminReports");
const end = code.indexOf("function AdminTitle", start);

if (start === -1 || end === -1) {
  throw new Error("AdminReports yoki AdminTitle topilmadi.");
}

const newReports = `function AdminReports({ appointments = [], payments = [] }) {
  function parseAmount(value) {
    const digits = String(value).replace(/\\D/g, "");
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

`;

code = code.slice(0, start) + newReports + code.slice(end);

fs.writeFileSync(appPath, code, "utf8");
console.log("Hisobotlar bo'limi professional analitika ko'rinishiga o'tkazildi.");