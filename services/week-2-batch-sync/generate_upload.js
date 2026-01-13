// services/week-2-batch-sync/generate_upload.js
require('dotenv').config({ path: '../../.env' }); // Puxa o .env da raiz
const fs = require('fs');
const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');

// CONFIGURAÇÕES
const FILE_NAME = 'big-data-import.csv';
const CONTAINER_NAME = 'high-volume-ingest';
const TARGET_ROWS = 100000; // Começamos com 100k. Mude para 1M se quiser estressar a máquina.
const LOCAL_FILE_PATH = path.join(__dirname, FILE_NAME);

// Função para gerar dados aleatórios simples (sem dependência pesada como Faker)
const generateRow = (index) => {
    const id = index;
    const name = `User ${index}`;
    // Email único para evitar duplicação no Salesforce depois
    const email = `user_w2_${index}_${Date.now()}@triad-lab.com`; 
    const company = index % 2 === 0 ? 'Triad Corp' : 'System Design LLC';
    return `${id},${name},${email},${company}\n`;
};

async function generateAndUpload() {
    console.log(`🚀 Iniciando geração de ${TARGET_ROWS} linhas...`);
    console.time('Tempo Total');

    // 1. GERAR ARQUIVO LOCAL (Streaming Write)
    const stream = fs.createWriteStream(LOCAL_FILE_PATH);
    
    // Cabeçalho CSV
    stream.write('ExternalId,Name,Email,Company\n');

    let i = 0;
    const writeData = () => {
        let ok = true;
        while (i < TARGET_ROWS && ok) {
            i++;
            // Se o buffer do disco encher, o stream.write retorna false (backpressure)
            ok = stream.write(generateRow(i));
        }
        
        if (i < TARGET_ROWS) {
            // Se parou por backpressure, espera o evento 'drain' para continuar
            stream.once('drain', writeData);
        } else {
            stream.end();
        }
    };

    writeData();

    await new Promise(resolve => stream.on('finish', resolve));
    console.log(`✅ Arquivo gerado localmente: ${LOCAL_FILE_PATH}`);

    // 2. UPLOAD PARA AZURE (Streaming Upload)
    console.log(`☁️  Iniciando upload para Azure Container: ${CONTAINER_NAME}...`);
    
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
        
        // Cria container se não existir
        await containerClient.createIfNotExists();

        const blockBlobClient = containerClient.getBlockBlobClient(FILE_NAME);
        
        // Upload usando stream de leitura (Memory Efficient)
        const fileStream = fs.createReadStream(LOCAL_FILE_PATH);
        await blockBlobClient.uploadStream(fileStream, 4 * 1024 * 1024, 20); // 4MB buffer

        console.log(`🎉 Upload concluído com sucesso!`);
        console.log(`📂 Arquivo disponível em: ${blockBlobClient.url}`);
        
    } catch (error) {
        console.error("❌ Erro no upload:", error.message);
    } finally {
        // Limpeza opcional: deletar arquivo local
        // fs.unlinkSync(LOCAL_FILE_PATH); 
        console.timeEnd('Tempo Total');
    }
}

generateAndUpload();