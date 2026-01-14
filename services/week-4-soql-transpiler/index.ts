// services/week-4-soql-transpiler/index.ts
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Transpiler } from './transpiler';

const sqlQueries = [
    "SELECT * FROM User",
    "SELECT * FROM Account"
];

sqlQueries.forEach(query => {
    console.log(`\n--- Transpilando: "${query}" ---`);
    try {
        const tokens = new Lexer(query).tokenize();
        const ast = new Parser(tokens).parse();
        const soql = new Transpiler().transpile(ast);
        console.log(`✅ SOQL Result: ${soql}`);
    } catch (e: any) {
        console.error(`❌ Erro: ${e.message}`);
    }
});