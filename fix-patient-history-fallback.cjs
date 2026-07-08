const fs = require("fs");
const path = require("path");

const appPath = path.join(process.cwd(), "src", "App.jsx");
let code = fs.readFileSync(appPath, "utf8");

const oldBlock = `  const patientHistory = isMainPatient
    ? history
    : [
        {
          date: selectedProfile.lastVisit,
          clinic: "MedLine Clinic",
          doctor: "Dr. Dilshod Rahimov",
          diagnosis: "Demo tibbiy yozuv",
          advice: "Bemor ma'lumotlari klinika bazasida saqlanmoqda.",
        },
      ];`;

const newBlock = `  const fallbackHistory = [
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
      ];`;

if (!code.includes(oldBlock)) {
  console.log("Kerakli blok topilmadi. Balki oldin o'zgargan bo'lishi mumkin.");
} else {
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync(appPath, code, "utf8");
  console.log("Kasallik tarixi fallback bilan to'g'rilandi.");
}