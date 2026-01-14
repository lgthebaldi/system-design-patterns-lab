// services/week-4-soql-transpiler/types.ts
export enum TokenType {
    SELECT = 'SELECT',
    FROM = 'FROM',
    ASTERISK = 'ASTERISK',
    IDENTIFIER = 'IDENTIFIER',
    EOF = 'EOF'
}

export interface Token {
    type: TokenType;
    value: string;
}

// A AST (Abstract Syntax Tree) - O coração do projeto
export interface SelectAST {
    fields: string[];
    table: string;
}