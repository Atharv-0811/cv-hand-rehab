"use client";

import React from "react";
import { Container, MantineProvider, createTheme, MantineColorsTuple } from "@mantine/core";
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
const primary: MantineColorsTuple = [
    "#f6f7fc",
    "#e9ecf8",
    "#dbe0f3",
    "#ced4ef",
    "#c1c8ea",
    "#a6b1e1", // main
    "#858eb4",
    "#6c7392",
    "#535971",
    "#3a3e4f"
];

const carbonBlack: MantineColorsTuple = [
    "#e9e9e9",
    "#c9c8c8",
    "#a8a7a7",
    "#878785",
    "#666664",
    "#252422", // main
    "#1e1d1b",
    "#181716",
    "#131211",
    "#0d0d0c"
];

const successGreen: MantineColorsTuple = [
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

const dangerRed: MantineColorsTuple = [
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

const warningAmber: MantineColorsTuple = [
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

const theme = createTheme({
    primaryColor: 'primary',
    primaryShade: {
        light: 5,
        dark: 5,
    },
    colors: {
        primary,
        carbonBlack,
        successGreen,
        warningAmber,
        dangerRed,
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
    } as any,
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
    } as any,
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

import { GamificationProvider } from "@/context/GamificationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider
            theme={theme}
            withGlobalClasses
        >
            <GamificationProvider>
                {children}
            </GamificationProvider>
        </MantineProvider>
    );
}
