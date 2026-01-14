// services/week-4-soql-transpiler/lexer.ts
import { Token, TokenType } from './types';
import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Transpiler } from './transpiler.js';

export class Lexer {
    private input: string;
    private pos: number = 0;

    constructor(input: string) {
        this.input = input;
    }

    tokenize(): Token[] {
        const tokens: Token[] = [];
        const words = this.input.split(/\s+/);

        for (const word of words) {
            const upper = word.toUpperCase();
            if (upper === 'SELECT') tokens.push({ type: TokenType.SELECT, value: upper });
            else if (upper === 'FROM') tokens.push({ type: TokenType.FROM, value: upper });
            else if (word === '*') tokens.push({ type: TokenType.ASTERISK, value: word });
            else if (word) tokens.push({ type: TokenType.IDENTIFIER, value: word });
        }

        tokens.push({ type: TokenType.EOF, value: '' });
        return tokens;
    }
}