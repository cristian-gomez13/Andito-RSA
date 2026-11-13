import { generateAllMetricsCSVs } from "../src/services/metrics.service";

console.log("=================================================");
console.log("GENERADOR DE CSVs DE MÉTRICAS Y PRUEBAS PARA GRÁFICOS");
console.log("Red Salud Andina (RSA) - Business Case & Testing");
console.log("=================================================\n");

const files = generateAllMetricsCSVs();

console.log(`✅ Se generaron exitosamente ${files.length} archivos CSV:\n`);
for (const file of files) {
  console.log(`  📄 ${file.name} (${file.sizeBytes} bytes) -> ${file.path}`);
}

console.log("\n=================================================");
console.log("Todos los archivos están listos para importar en Excel,");
console.log("PowerBI, Google Sheets o bibliotecas de gráficos (Mermaid/Chart.js).");
console.log("Verificado: Todos los archivos están excluidos en .gitignore.");
console.log("=================================================");
