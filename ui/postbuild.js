#!/usr/bin/env node
import fs from "fs";
import path from "path";

if (process.argv.length !== 4) {
    console.error("Usage: node postbuild.js <input.html> <output.h>");
    process.exit(1);
}

const inputPath = path.resolve(process.argv[2]);
const outputPath = path.resolve(process.argv[3]);

if (!fs.existsSync(inputPath)) {
    console.error(`Input file does not exist: ${inputPath}`);
    process.exit(1);
}

// Читаем HTML
let html = fs.readFileSync(inputPath, "utf-8");

// Убираем лишние пробелы между тегами
html = html.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();

// Убираем rel="stylesheet" из <style> — он ломает парсер C++
html = html.replace(/<style rel="stylesheet">/g, "<style>");

// Экранируем для C++ строки:
// 1. Сначала обратные слэши
// 2. Потом двойные кавычки
// 3. Переводы строк
const escaped =
    html.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\n");

// Генерируем .h файл — ОДНА строка, без разбивки на куски по 300 символов
// Разбивка по 300 символов была причиной проблемы!
const header = `#pragma once
// Auto-generated from ${path.basename(inputPath)}
// Do not edit manually.
constexpr const char INDEX_HTML[] = "${escaped}";
`;

fs.mkdirSync(path.dirname(outputPath), {recursive : true});
fs.writeFileSync(outputPath, header);
console.log(`Generated header: ${outputPath}`);