export function Text({ font, text, width, align, size, letterSpacing, lineHeight, wordSpacing, wordBreak, }: {
    font: any;
    text: any;
    width?: number;
    align?: string;
    size?: number;
    letterSpacing?: number;
    lineHeight?: number;
    wordSpacing?: number;
    wordBreak?: boolean;
}): void;
export class Text {
    constructor({ font, text, width, align, size, letterSpacing, lineHeight, wordSpacing, wordBreak, }: {
        font: any;
        text: any;
        width?: number;
        align?: string;
        size?: number;
        letterSpacing?: number;
        lineHeight?: number;
        wordSpacing?: number;
        wordBreak?: boolean;
    });
    resize: (options: any) => void;
    update: (options: any) => void;
}
