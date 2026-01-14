// services/week-4-soql-transpiler/transpiler.ts
import { SelectAST } from './types';
import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Transpiler } from './transpiler.js';

// Mapa de Tradução (Rules Engine do Compilador)
const SALESFORCE_MAPPING: Record<string, { table: string, fields: string[] }> = {
    'User': { table: 'User__c', fields: ['Id', 'Name'] },
    'Account': { table: 'Account__c', fields: ['Id', 'AccountNumber', 'Industry'] }
};

export class Transpiler {
    transpile(ast: SelectAST): string {
        const mapping = SALESFORCE_MAPPING[ast.table];
        
        if (!mapping) {
            throw new Error(`Mapeamento não encontrado para a tabela: ${ast.table}`);
        }

        // Se for asterisco, troca pelos campos mapeados do Salesforce
        const fields = ast.fields[0] === '*' ? mapping.fields : ast.fields;
        const table = mapping.table;

        return `SELECT ${fields.join(', ')} FROM ${table}`;
    }
}