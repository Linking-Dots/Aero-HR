import { CSSObject, RuleSet } from 'styled-components';
export declare const SMALL = 599;
export declare const MEDIUM = 959;
export declare const LARGE = 1280;
export declare const media: {
    sm: (literals: TemplateStringsArray, ...args: CSSObject[]) => RuleSet<object>;
    md: (literals: TemplateStringsArray, ...args: CSSObject[]) => RuleSet<object>;
    lg: (literals: TemplateStringsArray, ...args: CSSObject[]) => RuleSet<object>;
    custom: (value: number) => (literals: TemplateStringsArray, ...args: CSSObject[]) => RuleSet<object>;
};
