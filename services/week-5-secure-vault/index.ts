import { CryptoEngine, CryptoEnvelope } from './crypto-engine';

try {
    const engine = new CryptoEngine();
    const secretData = "salesforce-api-production-token-2026";

    console.log("--- 🔐 SECURE VAULT: ENVELOPE ENCRYPTION TEST ---");
    console.log("Original Secret:", secretData);

    const envelope: CryptoEnvelope = engine.encrypt(secretData);
    console.log("\n📦 Generated Secure Envelope:");
    console.log(JSON.stringify(envelope, null, 2));

    const decryptedData = engine.decrypt(envelope);
    console.log("\n🔑 Decrypted Content:", decryptedData);

    if (secretData === decryptedData) {
        console.log("\n✅ INTEGRITY CHECK PASSED: The vault is secure.");
    }

} catch (error: any) {
    console.error("\n❌ VAULT ERROR:", error.message);
}