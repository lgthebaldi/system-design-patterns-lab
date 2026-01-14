// services/week-4-soql-transpiler/parser.ts
import { Token, TokenType, SelectAST } from './types';
import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Transpiler } from './transpiler.js';
export class Parser {
    private tokens: Token[];
    private pos: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    // O objetivo aqui é montar a SelectAST: { fields: [], table: "" }
    parse(): SelectAST {
        this.consume(TokenType.SELECT);

        let fields: string[] = [];
        if (this.peek().type === TokenType.ASTERISK) {
            fields = ['*']; // Guardamos o asterisco para o Transpiler tratar depois
            this.consume(TokenType.ASTERISK);
        } else {
            fields.push(this.consume(TokenType.IDENTIFIER).value);
        }

        this.consume(TokenType.FROM);
        const table = this.consume(TokenType.IDENTIFIER).value;

        return { fields, table };
    }

    private peek(): Token {
        return this.tokens[this.pos];
    }

    private consume(type: TokenType): Token {
        const token = this.tokens[this.pos];
        if (token.type !== type) {
            throw new Error(`Expected ${type} but found ${token.type}`);
        }
        this.pos++;
        return token;
    }
}