// src/app/providers.tsx
"use client";

import React from "react";
import { Container, MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css"; // required global styles for Mantine v7
import { Poppins, Work_Sans } from "next/font/google";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-poppins",
    display: "swap",
});

const workSans = Work_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600"],
    variable: "--font-work-sans",
    display: "swap",
});

/**
 * Theme override — keep this minimal and type-safe.
 * Use CSS variables (set on <html> in layout.tsx) to point Mantine to next/font variables.
 */
const tealBrand: any = [
    '#E5F3F5',
    '#C6E4E9',
    '#A6D4DD',
    '#7FBECB',
    '#57A7B9',
    '#358CA4',
    '#1E6F84',
    '#145365', // dark-ish
    '#0F4C5C', // main
    '#09323D',
];

const coralAccent: any = [
    '#FDE9E7',
    '#F9D3CE',
    '#F5B7AE',
    '#F0958A',
    '#EB7467',
    '#E3645B', // main
    '#C44F48',
    '#A13E3A',
    '#7F2F2C',
    '#5C201F',
];

const sand: any = [
    '#FDFBF7',
    '#F7F3EC',
    '#EFE7D9',
    '#E4D6C3',
    '#D7C3A9',
    '#C8AF8E',
    '#B19270',
    '#97775A',
    '#7A5D47',
    '#5B4333',
];

const slate: any = [
    '#F8F8F8',
    '#EDEDED',
    '#DFDFDF',
    '#CFCFCF',
    '#B8B8B8',
    '#9E9E9E',
    '#7F7F7F',
    '#626262',
    '#444444',
    '#262626',
];

const successGreen: any = [
    '#E6F7ED',
    '#C3EBD2',
    '#9FDFB8',
    '#76D29A',
    '#4DC67D',
    '#2CB962',
    '#1D9C4F',
    '#167B3F',
    '#105A2E',
    '#09351B',
];

const warningAmber: any = [
    '#FFF7E6',
    '#FFE9BF',
    '#FFDA99',
    '#FFCB73',
    '#FFBC4D',
    '#FFAE26',
    '#F29C14',
    '#D5810F',
    '#B6660B',
    '#8A4807',
];

const dangerRed: any = [
    '#FDECEC',
    '#F9D0D0',
    '#F3A9A9',
    '#EC8282',
    '#E65B5B',
    '#DF3434',
    '#C32121',
    '#9E1919',
    '#791212',
    '#520B0B',
];

const infoBlue: any = [
    '#E7F1FF',
    '#C7DDFF',
    '#A6C8FF',
    '#82B0FF',
    '#5D98FF',
    '#3A81F7',
    '#2865D0',
    '#1D4EA4',
    '#143777',
    '#0C214A',
];

const softPurple: any = [
    '#F4E9FF',
    '#E3CCFF',
    '#D0ADFF',
    '#BC8DFF',
    '#A86DFF',
    '#924EF7',
    '#763CCE',
    '#5A2EA0',
    '#3E2072',
    '#231244',
];

const mint: any = [
    '#E7FAF5',
    '#C5F0E1',
    '#A3E6CD',
    '#7CDAB5',
    '#57CE9D',
    '#38C388',
    '#279E6E',
    '#1D7B56',
    '#14573E',
    '#0B3325',
];

const theme = createTheme({
    primaryColor: 'tealBrand',
    primaryShade: {
        light: 6,
        dark: 8,
    },
    colors: {
        tealBrand,
        coralAccent,
        sand,
        slate,
        successGreen,
        warningAmber,
        dangerRed,
        infoBlue,
        softPurple,
        mint,
    },
    defaultRadius: 'md',
    fontFamily: 'var(--mantine-font-family)',
    headings: {
        fontFamily: 'var(--mantine-font-family-headings)',
        fontWeight: '600',
        sizes: {
            h1: { fontSize: '48px', lineHeight: '1.2' },
            h2: { fontSize: '36px', lineHeight: '1.25' },
            h3: { fontSize: '36px', lineHeight: '1.3' },
            h4: { fontSize: '24px', lineHeight: '1.35' },
            h5: { fontSize: '20px', lineHeight: '1.4' },
            h6: { fontSize: '18px', lineHeight: '1.4' },
        },
    },
    fontSizes: {
        mh1: '36px',
        mh2: '32px',
        mh3: '28px',
        mh4: '24px',
        mh5: '20px',
        mh6: '16px',
        mh7: '14px',
        h1: '48px',
        h2: '36px',
        h3: '36px',
        h4: '24px',
        xl: '20px',
        lg: '18px',
        md: '16px',
    },
    spacing: {
        xxs: '0.25rem', // 4px
        xs: '0.5rem', // 8px
        xs2: '0.75rem', // 12px
        sm: '1rem', // 16px
        sm2: '1.25rem', // 20px
        sm3: '1.5rem', // 24px
        md2: '1.75rem', // 28px
        md: '2rem', // 32px
        md3: '3rem', // 48px
        lg: '4rem', // 64px
        xl: '6rem', // 96px
        xl2: '8rem', // 128px
        xl3: '10rem', // 160px
        xl4: '12rem', // 192px
        xl5: '14rem', // 224px
        xl6: '16rem', // 256px
        full: '100%', // 100%
        half: '50%', // 50%
    },
    components: {
        Container: Container.extend({
            defaultProps: {
                size: '1280px',
                fluid: false,
                px: 'sm',
            },
        }),
        TextInput: {
            styles: {
                input: {
                    'border': 'none',
                    'borderBottom': '1px solid #D5D2D1', // underline only
                    'borderRadius': 0,
                    'paddingLeft': 0, // align with label
                    'paddingRight': 0,
                    '&:focus': {
                        borderBottom: '2px solid #800000',
                    },
                },
                label: {
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#616161',
                },
            },
        },
        Textarea: {
            styles: {
                input: {
                    'border': 'none',
                    'borderBottom': '1px solid #D5D2D1', // underline only
                    'borderRadius': 0,
                    'paddingLeft': 0, // align with label
                    'paddingRight': 0,
                    '&:focus': {
                        borderBottom: '2px solid #800000',
                    },
                },
                label: {
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#616161',
                },
            },
        },
        Select: {
            styles: {
                input: {
                    'border': 'none',
                    'borderBottom': '1px solid #D5D2D1', // underline only
                    'borderRadius': 0,
                    'paddingLeft': 0, // align with label
                    'paddingRight': 0,
                    '&:focus': {
                        borderBottom: '2px solid #800000',
                    },
                },
                label: {
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#616161',
                },
            },
        },
    },
});

/**
 * Providers component — include the font variables classes on the wrapper here if needed,
 * but we set css variables on <html> in layout.tsx (server component) for maximum compatibility.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider
            theme={theme}
            withGlobalClasses
        >
            {children}
        </MantineProvider>
    );
}
