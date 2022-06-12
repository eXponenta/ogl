export interface IMSDFFont {
    chars: Array<any>;
    common: {
        lineHeight: number;
        base: number;
        scaleW: number;
        scaleH: number;
    };
    kernings: Array<{
        first: number;
        second: number;
        amount: number;
    }>;
}
export interface ITextInit {
    font: IMSDFFont;
    text: string;
    width?: number;
    align?: 'left' | 'right' | 'center';
    size?: number;
    letterSpacing?: number;
    lineHeight?: number;
    wordSpacing?: number;
    wordBreak?: boolean;
}
export declare function Text({ font, text, width, align, size, letterSpacing, lineHeight, wordSpacing, wordBreak, }: ITextInit): void;
