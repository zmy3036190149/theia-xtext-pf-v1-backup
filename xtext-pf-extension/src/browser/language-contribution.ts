import { injectable, inject } from 'inversify';
import { Workspace, Languages, LanguageClientFactory, BaseLanguageClientContribution } from '@theia/languages/lib/browser';

@injectable()
export class pfClientContribution extends BaseLanguageClientContribution {

    readonly id = "pf";
    readonly name = "PF";

    constructor(
        @inject(Workspace) protected readonly workspace: Workspace,
        @inject(Languages) protected readonly languages: Languages,
        @inject(LanguageClientFactory) protected readonly languageClientFactory: LanguageClientFactory
    ) {
        super(workspace, languages, languageClientFactory);
    }

    protected get globPatterns() {
        return [
            '**/*.pf'
        ];
    }
}

// register language with monaco on first load
registerpf();

export function registerpf() {
    // initialize monaco
    monaco.languages.register({
        id: 'pf',
        aliases: ['PF', 'pf'],
        extensions: ['.pf'],
        mimetypes: ['text/pf']
    })
    monaco.languages.setLanguageConfiguration('pf', {
        comments: {
            lineComment: "//",
            blockComment: ['/*', '*/']
        },
        brackets: [['{', '}'], ['(', ')']],
        autoClosingPairs: [
            {
                open: '{',
                close: '}'
            },
            {
                open: '(',
                close: ')'
            }]
    })
    monaco.languages.setMonarchTokensProvider('pf', <any>{
        // Set defaultToken to invalid to see what you do not tokenize yet
        // defaultToken: 'invalid',

        keywords: [
            'R', 'M', 'B','C','X','D','P','?'
        ],

        typeKeywords: [
            'boolean', 'number', 'string'
        ],

        operators: [
            '--','~~','~>','->'
        ],

        // we include these common regular expressions
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

        // The main tokenizer for our languages
        tokenizer: {
            root: [
                // identifiers and keywords
                [/[A-Za-z_$][\w$]*/, {
                    cases: {
                        '@typeKeywords': 'keyword',
                        //'@keywords': 'keyword',
                        '@default': 'identifier'
                    }
                }],

                [/\s[RMBCXDP?][\s\n]/, 'keyword'],  
                [/"[a-z]"/, 'type.identifier'],  

                // whitespace
                { include: '@whitespace' },

                // delimiters and operators
                [/[{}()\[\]]/, '@brackets'],
                [/[<>](?!@symbols)/, '@brackets'],
                [/@symbols/, {
                    cases: {
                        '@operators': 'keyword',
                        '@default': ''
                    }
                }]
            ],

            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/\/\*/, 'comment', '@comment'],
                [/\/\/.*$/, 'comment'],
            ],

            comment: [
                [/[^\/*]+/, 'comment'],
                [/\/\*/, 'comment.invalid'],
                ["\\*/", 'comment', '@pop'],
                [/[\/*]/, 'comment']
            ],

            string: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, 'string', '@pop']
            ],
        },
    })
}