// backend/queues/syncQueue.js
const { Queue, Worker } = require('bullmq');
const connection = require('../lib/redis');
const { BlobServiceClient } = require('@azure/storage-blob');
const csv = require('csv-parser');

// CONFIGURATION
const CONTAINER_NAME = 'high-volume-ingest';
const BATCH_SIZE = 100; // Process 100 rows at a time to save memory

// 1. Queue Definition
const syncQueue = new Queue('salesforce-sync', { connection });

// Helper: Process a batch of data
// In the future, this function will send data to Salesforce
async function processBatch(batch, batchNumber) {
    // Simulate API Latency (e.g., Sending 100 records to Salesforce takes ~500ms)
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`   📦 Batch #${batchNumber} processed: ${batch.length} records.`);
    // TODO: Week 2 Part B - Add logic here to insert into Salesforce
}

// 2. Worker Definition (The Real Stream Engine)
const worker = new Worker('salesforce-sync', async (job) => {
    console.log(`🚀 Worker started job: ${job.name}`);
    const { fileName } = job.data;
    
    // Connect to Azure
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    console.log(`📥 Downloading stream from Azure: ${fileName}...`);

    // Download response (Stream)
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    
    // THE STREAMING LOGIC
    return new Promise((resolve, reject) => {
        let batch = [];
        let batchCount = 0;
        let totalRows = 0;

        // Pipe the Azure stream directly into the CSV parser
        const stream = downloadBlockBlobResponse.readableStreamBody.pipe(csv());

        stream.on('data', async (row) => {
            // Add row to current batch
            batch.push(row);
            totalRows++;

            // If batch is full, we need to PAUSE the stream, process, and RESUME
            if (batch.length >= BATCH_SIZE) {
                stream.pause(); // 🛑 STOP reading to prevent memory overflow
                
                batchCount++;
                await processBatch(batch, batchCount);
                
                batch = []; // Clear memory
                stream.resume(); // ▶️ RESUME reading
            }
        });

        stream.on('end', async () => {
            // Process remaining items in the last batch
            if (batch.length > 0) {
                batchCount++;
                await processBatch(batch, batchCount);
            }
            console.log(`✅ Job Completed! Total Rows Processed: ${totalRows}`);
            console.log(`📊 Total Batches: ${batchCount}`);
            resolve({ status: 'completed', totalRows });
        });

        stream.on('error', (err) => {
            console.error('❌ Stream Error:', err);
            reject(err);
        });
    });

}, { 
    connection,
    concurrency: 1 // Only process 1 big file at a time per worker
});

module.exports = { syncQueue };