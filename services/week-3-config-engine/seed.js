const mongoose = require('mongoose');

async function seed() {
    console.log("🔌 Iniciando conexão forçada...");

    try {
        // 1. Conectar primeiro
        await mongoose.connect('mongodb://127.0.0.1:27017/triad_system', {
            serverSelectionTimeoutMS: 5000
        });
        console.log("✅ Conectado ao MongoDB!");

        // 2. Definir o Schema e o Model EXATAMENTE aqui dentro (evita buffering)
        const UiConfigSchema = new mongoose.Schema({
            screenName: { type: String, required: true, unique: true },
            title: String,
            layout: [{
                type: { type: String, required: true },
                props: mongoose.Schema.Types.Mixed,
                children: [mongoose.Schema.Types.Mixed],
                validation: {
                    required: Boolean,
                    min: Number,
                    errorMessage: String
                }
            }]
        });

        // Se o modelo já existir, deleta para redefinir
        if (mongoose.models.UiConfig) {
            delete mongoose.models.UiConfig;
        }
        const UiConfig = mongoose.model('UiConfig', UiConfigSchema);

        // 3. Executar operações
        console.log("🧹 Limpando dados antigos...");
        await UiConfig.deleteMany({});
        console.log("🗑️ Coleção limpa.");

        console.log("🚀 Injetando Layout Masterplan...");
        await UiConfig.create({
            screenName: "home",
            title: "Masterplan Dashboard",
            layout: [
                {
                    type: "alert",
                    props: { message: "Server-Driven UI Engine Active", variant: "info" },
                    children: []
                },
                {
                    type: "section",
                    props: { title: "Metrics Overview" },
                    children: [
                        { type: "card", props: { title: "Total Users", value: "1,204", icon: "users" } },
                        { type: "card", props: { title: "Revenue", value: "$45,200", icon: "dollar" } }
                    ]
                },
                {
                    type: "section",
                    props: { title: "Business Rules" },
                    children: [
                        {
                            type: "input",
                            props: { label: "Verification Age" },
                            validation: { required: true, min: 18, errorMessage: "Rule: Must be 18+ for access." }
                        },
                        { type: "button", props: { label: "Validate Data", color: "primary" } }
                    ]
                }
            ]
        });

        console.log("✨ SUCESSO ABSOLUTO: Week 3 Seeded!");

    } catch (err) {
        console.error("❌ ERRO NO SEED:", err.message);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Conexão encerrada.");
        process.exit();
    }
}

seed();