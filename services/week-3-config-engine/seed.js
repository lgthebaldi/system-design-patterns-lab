// services/week-3-config-engine/seed.js
const mongoose = require('mongoose');

// Schema simples para o seed (cópia simplificada do backend)
const UiConfigSchema = new mongoose.Schema({
    screenName: String,
    title: String,
    layout: Array,
    version: Number
});
const UiConfig = mongoose.model('UiConfig', UiConfigSchema);

async function seed() {
    await mongoose.connect('mongodb://localhost:27017/triad_system');
    console.log("🔌 Connected to Mongo for Seeding...");

    // 1. Limpa configurações antigas
    await UiConfig.deleteMany({});

    // 2. Define a tela 'home' (Server-Driven UI)
    const homeScreen = {
        screenName: "home",
        title: "Dynamic Dashboard V1",
        version: 1,
        layout: [
            {
                type: "alert",
                props: { message: "Welcome to Server-Driven UI! This alert implies a JSON.", variant: "info" }
            },
            {
                type: "section",
                props: { title: "Metrics Overview" },
                children: [
                    {
                        type: "card",
                        props: { title: "Total Users", value: "1,204", icon: "users" }
                    },
                    {
                        type: "card",
                        props: { title: "Revenue", value: "$45,200", icon: "dollar" }
                    }
                ]
            },
            {
                type: "button",
                props: { label: "Refresh Data", action: "refresh_api", color: "primary" }
            }
        ]
    };

    // 3. Salva no Banco
    await UiConfig.create(homeScreen);
    console.log("✅ Database seeded with 'home' screen config!");
    
    mongoose.disconnect();
}

seed();