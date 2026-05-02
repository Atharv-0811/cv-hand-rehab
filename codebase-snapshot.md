# Codebase Snapshot

## 1. Tech Stack & Environment

- **Primary languages:** TypeScript, JavaScript, CSS
- **Framework/runtime:** Next.js 16 (App Router), React 19, Yarn
- **UI/styling:** Mantine, Tailwind CSS v4, PostCSS
- **Computer vision/audio:** MediaPipe Hands/Pose, TensorFlow.js, Web Audio API + AudioWorklet
- **Animation/icons:** Lottie (`lottie-react`), Tabler Icons (`@tabler/icons-react`)
- **Quality/tooling:** ESLint 9, TypeScript 5
- **TypeScript settings:** `strict: true`, `moduleResolution: bundler`, alias `@/* -> ./src/*`

**Dependencies (`package.json`)**

- `@mantine/core`: `^9.1.0`
- `@mantine/hooks`: `^9.1.0`
- `@mediapipe/drawing_utils`: `^0.3.1675466124`
- `@mediapipe/hands`: `^0.4.1675469240`
- `@mediapipe/pose`: `^0.5.1675469404`
- `@tabler/icons-react`: `^3.41.1`
- `@tensorflow/tfjs-backend-webgl`: `^4.22.0`
- `@tensorflow/tfjs-core`: `^4.22.0`
- `lottie-react`: `^2.4.1`
- `next`: `16.1.6`
- `react`: `19.2.3`
- `react-dom`: `19.2.3`

**Dev Dependencies (`package.json`)**

- `@tailwindcss/postcss`: `^4`
- `@types/node`: `^20`
- `@types/react`: `^19`
- `@types/react-dom`: `^19`
- `babel-plugin-react-compiler`: `1.0.0`
- `eslint`: `^9`
- `eslint-config-next`: `16.1.6`
- `postcss-preset-mantine`: `^1.18.0`
- `postcss-simple-vars`: `^7.0.1`
- `tailwindcss`: `^4`
- `typescript`: `^5`

## 2. Complete Project Directory Tree

```text
cv-hand-rehab/
├── public
│   ├── animations
│   │   ├── celebration.json
│   │   └── loading.json
│   └── cv-processor.js
├── src
│   ├── app
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components
│   │   ├── exercises
│   │   │   ├── ExerciseTargetBanner.tsx
│   │   │   ├── HandOpenClose.tsx
│   │   │   └── StretchIndicator.tsx
│   │   ├── gamification
│   │   │   ├── LevelBanner.tsx
│   │   │   ├── ProgressGraph.tsx
│   │   │   └── StreakCounter.tsx
│   │   └── CameraMirror.tsx
│   ├── context
│   │   └── SessionContext.tsx
│   ├── hooks
│   │   ├── useAudioEngine.ts
│   │   ├── useGamification.ts
│   │   ├── useHandTracking.ts
│   │   └── usePoseDetection.ts
│   └── utils
│       └── smoothing.ts
├── .gitignore
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── physio_cv_architecture_context.md
├── postcss.config.mjs
├── project.md
├── providers.tsx
├── README.md
└── tsconfig.json
```

## 3. Full File Contents

### `src/app/globals.css`
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  
  --color-primary-50: #f6f7fc;
  --color-primary-100: #e9ecf8;
  --color-primary-200: #dbe0f3;
  --color-primary-300: #ced4ef;
  --color-primary-400: #c1c8ea;
  --color-primary-500: #a6b1e1;
  --color-primary-600: #858eb4;
  --color-primary-700: #6c7392;
  --color-primary-800: #535971;
  --color-primary-900: #3a3e4f;
  --color-primary: var(--color-primary-500);

  --color-carbonBlack-50: #e9e9e9;
  --color-carbonBlack-100: #c9c8c8;
  --color-carbonBlack-200: #a8a7a7;
  --color-carbonBlack-300: #878785;
  --color-carbonBlack-400: #666664;
  --color-carbonBlack-500: #252422;
  --color-carbonBlack-600: #1e1d1b;
  --color-carbonBlack-700: #181716;
  --color-carbonBlack-800: #131211;
  --color-carbonBlack-900: #0d0d0c;
  --color-carbonBlack: var(--color-carbonBlack-500);
  --color-brandWhite: #FFFDF5;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

.hover-card:hover {
  border-color: var(--mantine-color-primary-5) !important;
  background-color: var(--mantine-color-primary-0) !important;
  transform: translateY(-4px);
}

.fade-in {
  animation: fade-in 0.5s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### `src/app/layout.tsx`
```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { SessionProvider } from '@/context/SessionContext';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Physio-CV',
  description: 'Browser-based gamified rehabilitation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        {/* MediaPipe loaded globally so all exercise components can access window.Hands */}
        <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        <Providers>
          <SessionProvider>
            {children}
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
```

### `src/app/page.tsx`
```tsx
// 'use client';
// import { useSession } from '@/context/SessionContext';
// import { Title, Text, Group, Box, Stack, SimpleGrid, UnstyledButton, Container } from '@mantine/core';
// import HandOpenClose from '@/components/exercises/HandOpenClose';
// import { useGamification } from '@/hooks/useGamification';
// import { LevelBanner } from '@/components/gamification/LevelBanner';
// import { StreakCounter } from '@/components/gamification/StreakCounter';
// import { ProgressGraph } from '@/components/gamification/ProgressGraph';

// export default function Dashboard() {
//   const { activeExercise, setActiveExercise, globalScore } = useSession();
//   const {
//     currentLevel,
//     currentXP,
//     dailyStreak,
//     isHydrated,
//     hasLeveledUp,
//     addXP,
//     getChartData,
//     xpToNextLevel,
//     progressInLevel,
//   } = useGamification();
//   const chartData = isHydrated ? getChartData() : [];

//   return (
//     <Box component="main" bg="#FFFDF5" mih="100vh" py="xl" px="md">
//       <LevelBanner visible={hasLeveledUp} currentLevel={currentLevel} dailyStreak={dailyStreak} />
//       <Container size="md">
//         <Group justify="space-between" mb="md3" pb="sm3" style={{ borderBottom: '1px solid var(--mantine-color-carbonBlack-1)' }}>
//           <Title order={1} fw={700} c="carbonBlack.9" lts="-0.02em">
//             Hand Rehab using Auditory Feedback
//           </Title>
//           {/* <Group gap="xs" bg="primary.0" px="md" py="xs" style={{ borderRadius: '100px', border: '1px solid var(--mantine-color-primary-2)' }}>
//             <Text size="sm" c="carbonBlack.5" tt="uppercase" lts="0.05em" fw={500}>Total Score</Text>
//             <Text size="xl" fw={700} c="primary.8">{globalScore}</Text>
//           </Group> */}
//         </Group>

//         {activeExercise === 'MENU' && (
//           <Box className="fade-in">
//             <Text size="xl" c="carbonBlack.8" mb="sm3" fw={500}>Select Today&apos;s Routine</Text>

//             <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm3">
//               <UnstyledButton
//                 onClick={() => setActiveExercise('HAND_OPEN_CLOSE')}
//                 p="sm3"
//                 bg="white"
//                 style={{
//                   border: '1px solid var(--mantine-color-carbonBlack-2)',
//                   borderRadius: 'var(--mantine-radius-md)',
//                   transition: 'all 0.2s ease',
//                 }}
//                 className="hover-card"
//               >
//                 <Stack gap="xs">
//                   <Box
//                     w={48} h={48}
//                     bg="primary.1"
//                     c="primary.9"
//                     style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}
//                   >
//                     🖐
//                   </Box>
//                   <Title order={3} size="lg" c="carbonBlack.9">Hand Extension</Title>
//                   <Text size="sm" c="carbonBlack.6" style={{ lineHeight: 1.6 }}>
//                     Focuses on finger mobility and palm stretching. Uses audio-filtered feedback.
//                   </Text>
//                 </Stack>
//               </UnstyledButton>

//               <UnstyledButton
//                 disabled
//                 p="sm3"
//                 bg="carbonBlack.0"
//                 style={{
//                   border: '1px solid var(--mantine-color-carbonBlack-1)',
//                   borderRadius: 'var(--mantine-radius-md)',
//                   opacity: 0.6,
//                   cursor: 'not-allowed',
//                 }}
//               >
//                 <Stack gap="xs">
//                   <Box
//                     w={48} h={48}
//                     bg="carbonBlack.1"
//                     c="carbonBlack.4"
//                     style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}
//                   >
//                     🔄
//                   </Box>
//                   <Title order={3} size="lg" c="carbonBlack.4">Wrist Rotation</Title>
//                   <Text size="sm" c="carbonBlack.4" style={{ lineHeight: 1.6 }}>
//                     Coming soon. Focuses on pronation and supination of the forearm.
//                   </Text>
//                 </Stack>
//               </UnstyledButton>
//             </SimpleGrid>

//             {/* Light Themed Gamification Stats */}
//             <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="xl">
              
//               {/* Progression Box */}
//               <Box
//                 bg="#FFFFFF"
//                 p="md"
//                 style={{
//                   border: '1px solid var(--mantine-color-carbonBlack-1)',
//                   borderRadius: 'var(--mantine-radius-md)'
//                 }}
//               >
//                 <Text size="xs" tt="uppercase" lts="0.1em" c="carbonBlack.4" fw={600}>Progression</Text>
//                 <Group justify="space-between" align="flex-end" mt="sm">
//                   <Text ff="monospace" size="xl" fw={700} c="carbonBlack.9">Level {currentLevel}</Text>
//                   <Text ff="monospace" size="sm" c="carbonBlack.5">{currentXP} XP</Text>
//                 </Group>
                
//                 <Box mt="md" h={8} w="100%" bg="carbonBlack.0" style={{ borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}>
//                   <Box 
//                     h="100%" 
//                     bg="primary.5" 
//                     style={{ 
//                       width: `${Math.max(2, progressInLevel)}%`, 
//                       borderRadius: 'var(--mantine-radius-md)',
//                       transition: 'width 0.4s ease'
//                     }} 
//                   />
//                 </Box>
//                 <Text mt="xs" size="xs" ff="monospace" lts="0.1em" c="carbonBlack.4">{xpToNextLevel} XP TO NEXT LEVEL</Text>
//               </Box>

//               {/* Streak Counter Wrapper */}
//               <Box
//                 bg="#FFFFFF"
//                 style={{
//                   border: '1px solid var(--mantine-color-carbonBlack-1)',
//                   borderRadius: 'var(--mantine-radius-md)',
//                   overflow: 'hidden'
//                 }}
//               >
//                 <StreakCounter dailyStreak={dailyStreak} />
//               </Box>

//             </SimpleGrid>

//             {/* Graph Wrapper */}
//             <Box
//               mt="md"
//               bg="#FFFFFF"
//               style={{
//                 border: '1px solid var(--mantine-color-carbonBlack-1)',
//                 borderRadius: 'var(--mantine-radius-md)',
//                 overflow: 'hidden'
//               }}
//             >
//               <ProgressGraph data={chartData} />
//             </Box>

//           </Box>
//         )}

//         {activeExercise === 'HAND_OPEN_CLOSE' && <HandOpenClose onSessionComplete={addXP} />}
//       </Container>
//     </Box>
//   );
// }

'use client';

import { useSession } from '@/context/SessionContext';
import {
  Title,
  Text,
  Group,
  Box,
  Stack,
  SimpleGrid,
  UnstyledButton,
  Container,
  Paper,
  Badge,
  ThemeIcon,
  Divider,
  RingProgress,
} from '@mantine/core';
import HandOpenClose from '@/components/exercises/HandOpenClose';
import { useGamification } from '@/hooks/useGamification';
import { LevelBanner } from '@/components/gamification/LevelBanner';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { ProgressGraph } from '@/components/gamification/ProgressGraph';
import {
  IconHandStop,
  IconRotate,
  IconLock,
  IconChevronRight,
  IconTrophy,
  IconFlame,
  IconStars,
} from '@tabler/icons-react';

export default function Dashboard() {
  const { activeExercise, setActiveExercise, globalScore } = useSession();
  const {
    currentLevel,
    currentXP,
    dailyStreak,
    isHydrated,
    hasLeveledUp,
    addXP,
    getChartData,
    xpToNextLevel,
    progressInLevel,
  } = useGamification();

  const chartData = isHydrated ? getChartData() : [];

  const exercises = [
    {
      id: 'HAND_OPEN_CLOSE',
      icon: <IconHandStop size={26} stroke={1.5} />,
      iconBg: 'primary.1',
      iconColor: 'primary.7',
      label: 'Hand Extension',
      description: 'Improve finger mobility and palm flexibility using guided audio feedback.',
      badge: "Today's Exercise",
      badgeColor: 'successGreen',
      available: true,
    },
    {
      id: 'WRIST_ROTATION',
      icon: <IconRotate size={26} stroke={1.5} />,
      iconBg: 'carbonBlack.0',
      iconColor: 'carbonBlack.4',
      label: 'Wrist Rotation',
      description: 'Focuses on pronation and supination of the forearm. Coming soon.',
      badge: 'Coming Soon',
      badgeColor: 'carbonBlack',
      available: false,
    },
  ];

  return (
    <Box
      component="main"
      bg="#FFFDF5"
      mih="100vh"
      style={{ fontFamily: 'var(--font-work-sans, sans-serif)' }}
    >
      <LevelBanner
        visible={hasLeveledUp}
        currentLevel={currentLevel}
        dailyStreak={dailyStreak}
      />

      {/* Top Header Bar */}
      <Box
        bg="white"
        py="sm3"
        px="md"
        style={{
          borderBottom: '1px solid var(--mantine-color-carbonBlack-1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container size="lg">
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Text
                size="mh7"
                c="carbonBlack.5"
                tt="uppercase"
                lts="0.12em"
                fw={600}
                style={{ fontFamily: 'var(--font-work-sans, sans-serif)', fontSize: '13px' }}
              >
                Hand Rehabilitation Program
              </Text>
              <Title
                order={1}
                fw={700}
                c="carbonBlack.9"
                lts="-0.03em"
                style={{
                  fontFamily: 'var(--font-poppins, sans-serif)',
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  lineHeight: 1.2,
                }}
              >
                Auditory Feedback Training
              </Title>
            </Stack>

            <Group gap="xs2" align="center">
              <Paper
                withBorder
                radius="md"
                px="sm2"
                py="xs2"
                style={{ borderColor: 'var(--mantine-color-warningAmber-3)', background: 'var(--mantine-color-warningAmber-0)' }}
              >
                <Group gap="xs" align="center">
                  <IconFlame size={16} color="var(--mantine-color-warningAmber-6)" />
                  <Text fw={700} size="sm" c="warningAmber.7" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
                    {dailyStreak} day{dailyStreak !== 1 ? 's' : ''}
                  </Text>
                </Group>
              </Paper>
              <Paper
                withBorder
                radius="md"
                px="sm2"
                py="xs2"
                style={{ borderColor: 'var(--mantine-color-primary-2)', background: 'var(--mantine-color-primary-0)' }}
              >
                <Group gap="xs" align="center">
                  <IconStars size={16} color="var(--mantine-color-primary-7)" />
                  <Text fw={700} size="sm" c="primary.8" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
                    Level {currentLevel}
                  </Text>
                </Group>
              </Paper>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Main Content */}
      <Container size="lg" py="md3" px="xs">
        {activeExercise === 'MENU' && (
          <Stack gap="md3">

            {/* Section: Choose Exercise */}
            <Stack gap="sm2">
              <Group justify="space-between" align="flex-end">
                <Stack gap={2}>
                  <Text
                    size="xs"
                    tt="uppercase"
                    lts="0.1em"
                    c="carbonBlack.5"
                    fw={600}
                    style={{ fontSize: '12px' }}
                  >
                    Step 1
                  </Text>
                  <Title
                    order={2}
                    fw={700}
                    c="carbonBlack.9"
                    lts="-0.02em"
                    style={{
                      fontFamily: 'var(--font-poppins, sans-serif)',
                      fontSize: 'clamp(18px, 2.5vw, 22px)',
                    }}
                  >
                    Choose Your Exercise
                  </Title>
                </Stack>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm3">
                {exercises.map((exercise) =>
                  exercise.available ? (
                    <UnstyledButton
                      key={exercise.id}
                      onClick={() => setActiveExercise(exercise.id as any)}
                      style={{ display: 'block' }}
                    >
                      <Paper
                        shadow="xs"
                        radius="md"
                        p="sm3"
                        bg="white"
                        withBorder
                        style={{
                          borderColor: 'var(--mantine-color-carbonBlack-2)',
                          transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease',
                          cursor: 'pointer',
                        }}
                        className="exercise-card"
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.boxShadow =
                            '0 4px 16px rgba(0,0,0,0.08)';
                          (e.currentTarget as HTMLElement).style.borderColor =
                            'var(--mantine-color-primary-4)';
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.boxShadow = '';
                          (e.currentTarget as HTMLElement).style.borderColor =
                            'var(--mantine-color-carbonBlack-2)';
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        }}
                      >
                        <Stack gap="sm2">
                          <Group justify="space-between" align="flex-start">
                            <ThemeIcon
                              size={52}
                              radius="md"
                              variant="light"
                              color="primary"
                              style={{ background: 'var(--mantine-color-primary-1)' }}
                            >
                              {exercise.icon}
                            </ThemeIcon>
                            <Badge
                              size="sm"
                              radius="sm"
                              variant="light"
                              color="successGreen"
                              fw={600}
                              style={{ fontSize: '11px', letterSpacing: '0.03em' }}
                            >
                              {exercise.badge}
                            </Badge>
                          </Group>

                          <Stack gap={4}>
                            <Title
                              order={3}
                              fw={600}
                              c="carbonBlack.9"
                              style={{
                                fontFamily: 'var(--font-poppins, sans-serif)',
                                fontSize: '17px',
                              }}
                            >
                              {exercise.label}
                            </Title>
                            <Text
                              size="sm"
                              c="carbonBlack.6"
                              lh={1.65}
                              style={{ fontFamily: 'var(--font-work-sans, sans-serif)' }}
                            >
                              {exercise.description}
                            </Text>
                          </Stack>

                          <Group justify="flex-end" mt="xs">
                            <Group gap={4} align="center">
                              <Text
                                size="sm"
                                fw={600}
                                c="primary.7"
                                style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
                              >
                                Start Exercise
                              </Text>
                              <IconChevronRight size={15} color="var(--mantine-color-primary-7)" stroke={2.5} />
                            </Group>
                          </Group>
                        </Stack>
                      </Paper>
                    </UnstyledButton>
                  ) : (
                    <Paper
                      key={exercise.id}
                      shadow="none"
                      radius="md"
                      p="sm3"
                      bg="carbonBlack.0"
                      withBorder
                      style={{
                        borderColor: 'var(--mantine-color-carbonBlack-1)',
                        opacity: 0.6,
                        cursor: 'not-allowed',
                      }}
                    >
                      <Stack gap="sm2">
                        <Group justify="space-between" align="flex-start">
                          <ThemeIcon
                            size={52}
                            radius="md"
                            variant="light"
                            color="gray"
                            style={{ background: 'var(--mantine-color-carbonBlack-1)' }}
                          >
                            <IconLock size={22} stroke={1.5} color="var(--mantine-color-carbonBlack-4)" />
                          </ThemeIcon>
                          <Badge
                            size="sm"
                            radius="sm"
                            variant="light"
                            color="gray"
                            fw={600}
                            style={{ fontSize: '11px', letterSpacing: '0.03em' }}
                          >
                            {exercise.badge}
                          </Badge>
                        </Group>

                        <Stack gap={4}>
                          <Title
                            order={3}
                            fw={600}
                            c="carbonBlack.4"
                            style={{
                              fontFamily: 'var(--font-poppins, sans-serif)',
                              fontSize: '17px',
                            }}
                          >
                            {exercise.label}
                          </Title>
                          <Text
                            size="sm"
                            c="carbonBlack.3"
                            lh={1.65}
                            style={{ fontFamily: 'var(--font-work-sans, sans-serif)' }}
                          >
                            {exercise.description}
                          </Text>
                        </Stack>
                      </Stack>
                    </Paper>
                  )
                )}
              </SimpleGrid>
            </Stack>

            {/* Divider */}
            <Divider color="carbonBlack.1" />

            {/* Section: Your Progress */}
            <Stack gap="sm2">
              <Stack gap={2}>
                <Text
                  size="xs"
                  tt="uppercase"
                  lts="0.1em"
                  c="carbonBlack.5"
                  fw={600}
                  style={{ fontSize: '12px' }}
                >
                  Step 2
                </Text>
                <Title
                  order={2}
                  fw={700}
                  c="carbonBlack.9"
                  lts="-0.02em"
                  style={{
                    fontFamily: 'var(--font-poppins, sans-serif)',
                    fontSize: 'clamp(18px, 2.5vw, 22px)',
                  }}
                >
                  Your Progress
                </Title>
              </Stack>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm3">
                {/* Level & XP Card */}
                <Paper
                  shadow="xs"
                  radius="md"
                  p="sm3"
                  bg="white"
                  withBorder
                  style={{ borderColor: 'var(--mantine-color-carbonBlack-2)' }}
                >
                  <Group justify="space-between" align="flex-start" mb="sm2">
                    <Stack gap={2}>
                      <Text
                        size="xs"
                        tt="uppercase"
                        lts="0.1em"
                        c="carbonBlack.5"
                        fw={600}
                        style={{ fontSize: '11px' }}
                      >
                        Progression
                      </Text>
                      <Group gap="xs" align="baseline">
                        <Title
                          order={2}
                          fw={800}
                          c="carbonBlack.9"
                          style={{
                            fontFamily: 'var(--font-poppins, sans-serif)',
                            fontSize: '28px',
                            lineHeight: 1,
                          }}
                        >
                          Level {currentLevel}
                        </Title>
                      </Group>
                    </Stack>
                    <RingProgress
                      size={64}
                      thickness={6}
                      roundCaps
                      sections={[
                        {
                          value: Math.max(2, progressInLevel),
                          color: 'var(--mantine-color-primary-5)',
                        },
                      ]}
                      label={
                        <Text ta="center" fw={700} size="xs" c="primary.7">
                          {Math.round(progressInLevel)}%
                        </Text>
                      }
                    />
                  </Group>

                  <Stack gap="xs">
                    <Box
                      h={8}
                      w="100%"
                      bg="carbonBlack.1"
                      style={{
                        borderRadius: '99px',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        h="100%"
                        bg="primary.5"
                        style={{
                          width: `${Math.max(2, progressInLevel)}%`,
                          borderRadius: '99px',
                          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />
                    </Box>
                    <Group justify="space-between">
                      <Text size="xs" c="carbonBlack.5" fw={500} ff="monospace">
                        {currentXP.toLocaleString()} XP earned
                      </Text>
                      <Text size="xs" c="carbonBlack.4" fw={500} ff="monospace">
                        {xpToNextLevel} XP to go
                      </Text>
                    </Group>
                  </Stack>
                </Paper>

                {/* Streak Card */}
                <Paper
                  shadow="xs"
                  radius="md"
                  bg="white"
                  withBorder
                  style={{
                    borderColor: 'var(--mantine-color-carbonBlack-2)',
                    overflow: 'hidden',
                  }}
                >
                  <StreakCounter dailyStreak={dailyStreak} />
                </Paper>
              </SimpleGrid>
            </Stack>

            {/* Divider */}
            <Divider color="carbonBlack.1" />

            {/* Section: Activity History */}
            <Stack gap="sm2">
              <Stack gap={2}>
                <Text
                  size="xs"
                  tt="uppercase"
                  lts="0.1em"
                  c="carbonBlack.5"
                  fw={600}
                  style={{ fontSize: '12px' }}
                >
                  History
                </Text>
                <Title
                  order={2}
                  fw={700}
                  c="carbonBlack.9"
                  lts="-0.02em"
                  style={{
                    fontFamily: 'var(--font-poppins, sans-serif)',
                    fontSize: 'clamp(18px, 2.5vw, 22px)',
                  }}
                >
                  Activity Over Time
                </Title>
              </Stack>

              <Paper
                shadow="xs"
                radius="md"
                bg="white"
                withBorder
                style={{
                  borderColor: 'var(--mantine-color-carbonBlack-2)',
                  overflow: 'hidden',
                }}
              >
                <Box p="sm3" pb={0}>
                  <Group gap="xs" align="center">
                    <IconTrophy size={16} color="var(--mantine-color-warningAmber-6)" stroke={1.5} />
                    <Text
                      size="sm"
                      fw={600}
                      c="carbonBlack.7"
                      style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
                    >
                      Weekly Performance
                    </Text>
                  </Group>
                </Box>
                <ProgressGraph data={chartData} />
              </Paper>
            </Stack>

          </Stack>
        )}

        {activeExercise === 'HAND_OPEN_CLOSE' && (
          <HandOpenClose onSessionComplete={addXP} />
        )}
      </Container>

      {/* Footer */}
      {activeExercise === 'MENU' && (
        <Box
          py="sm3"
          mt="md3"
          style={{ borderTop: '1px solid var(--mantine-color-carbonBlack-1)' }}
        >
          <Container size="lg">
            <Text
              size="xs"
              c="carbonBlack.4"
              ta="center"
              style={{
                fontFamily: 'var(--font-work-sans, sans-serif)',
                letterSpacing: '0.02em',
              }}
            >
              Complete your daily session to maintain your streak. Consistency is key to recovery.
            </Text>
          </Container>
        </Box>
      )}
    </Box>
  );
}
```

### `src/app/providers.tsx`
```tsx
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
```

### `src/components/CameraMirror.tsx`
```tsx
'use client';
import { useEffect, useState, useRef } from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../../public/animations/loading.json';

interface CameraMirrorProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onReady: () => void;
  onError: (err: string) => void;
}

export const CameraMirror = ({ videoRef, onReady, onError }: CameraMirrorProps) => {
  const [camStatus, setCamStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const isInitialized = useRef(false); // Prevents rapid re-triggering

  useEffect(() => {
    async function setupCamera() {
      if (isInitialized.current) return;
      isInitialized.current = true;

      try {
        if (!navigator.mediaDevices) throw new Error("Browser does not support camera.");
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCamStatus('ready');
            onReady(); 
          };
        }
      } catch (err: any) {
        setCamStatus('error');
        if (err.name === 'NotAllowedError') onError("Camera access denied.");
        else onError("Camera blocked or currently in use.");
      }
    }
    setupCamera();
  }, []); // <-- EMPTY ARRAY STOPS THE SEIZURE FLICKER

  return (
    <div className="relative w-full bg-carbonBlack-900 border border-carbonBlack-200 shadow-sm rounded-md overflow-hidden aspect-video flex items-center justify-center">
      {camStatus === 'loading' && (
        <div className="absolute z-10 flex flex-col items-center justify-center">
          <Lottie animationData={loadingAnimation} loop={true} style={{ width: 150, height: 150 }} />
          <p className="text-carbonBlack-400 font-mono mt-2 text-sm">Initializing Hardware...</p>
        </div>
      )}
      {camStatus === 'error' && <p className="text-red-500 font-mono absolute z-10 text-center">⚠ Camera Error</p>}
      
      <video
        ref={videoRef}
        className={`w-full h-full object-cover -scale-x-100 transition-opacity duration-300 ${camStatus === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        muted
        playsInline
      />
    </div>
  );
};
```

### `src/components/exercises/ExerciseTargetBanner.tsx`
```tsx
'use client';

import { Transition, Box, Text, Group, ThemeIcon } from '@mantine/core';
import Lottie from 'lottie-react';
import celebrationAnimation from '../../../public/animations/celebration.json';

type ExerciseTargetBannerProps = {
  visible: boolean;
  newTarget: number;
};

export function ExerciseTargetBanner({ visible, newTarget }: ExerciseTargetBannerProps) {
  return (
    <Box 
      pos="fixed" 
      top={24} 
      left={0} 
      right={0} 
      style={{ 
        zIndex: 1000, 
        display: 'flex', 
        justifyContent: 'center', 
        pointerEvents: 'none' // Ensures users can still click things underneath it
      }}
    >
      <Transition
        mounted={visible}
        transition="slide-down"
        duration={400}
        timingFunction="ease-out"
      >
        {(styles) => (
          <Box style={{ ...styles, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Lottie Animation Layer */}
            <Box
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                height: 400,
                zIndex: 0,
                pointerEvents: 'none'
              }}
            >
              <Lottie animationData={celebrationAnimation} loop={false} />
            </Box>

            {/* Banner UI Layer */}
            <Box
              bg="#FFFFFF"
              px="xl"
              py="sm"
              style={{
                border: '2px solid var(--mantine-color-tealBrand-5)',
                borderRadius: 'var(--mantine-radius-md)',
                boxShadow: '0 8px 30px rgba(15, 76, 92, 0.15)', // Soft tealBrand glow
                zIndex: 1, // ensure it's above the lottie
                position: 'relative' // relative context for z-index
              }}
            >
              <Group gap="md">
                <ThemeIcon color="tealBrand.1" c="tealBrand.8" size="lg" radius="md">
                  🔥
                </ThemeIcon>
                <Box>
                  <Text size="xs" tt="uppercase" lts="0.1em" c="tealBrand.7" fw={800}>
                    Target Smashed!
                  </Text>
                  <Text ff="monospace" size="sm" c="carbonBlack.7" mt={2}>
                    Pushing new goal to: <Text component="span" fw={700} c="tealBrand.6">{newTarget.toFixed(2)}</Text>
                  </Text>
                </Box>
              </Group>
            </Box>
          </Box>
        )}
      </Transition>
    </Box>
  );
}
```

### `src/components/exercises/HandOpenClose.tsx`
```tsx
// 'use client';
// import { useRef, useState, useEffect } from 'react';
// import { useHandTracking } from '@/hooks/useHandTracking';
// import { useAudioEngine } from '@/hooks/useAudioEngine';
// import { CameraMirror } from '@/components/CameraMirror';
// import { StretchIndicator } from '@/components/exercises/StretchIndicator';
// import { useSession } from '@/context/SessionContext';

// import { ExerciseTargetBanner } from './ExerciseTargetBanner';
// import Lottie from 'lottie-react';
// import loadingAnimation from '../../../public/animations/loading.json';

// type ExerciseState = 'IDLE' | 'INITIALIZING' | 'CALIBRATION' | 'RUNNING';

// interface HandOpenCloseProps {
//   onSessionComplete?: (xp: number) => void;
// }

// export default function HandOpenClose({ onSessionComplete }: HandOpenCloseProps) {
//   const { setActiveExercise } = useSession();
//   const [exerciseState, setExerciseState] = useState<ExerciseState>('IDLE');
//   const [camError, setCamError] = useState<string | null>(null);
//   const [isCamReady, setIsCamReady] = useState(false);
//   const [hasAwardedXP, setHasAwardedXP] = useState(false);

//   const [showTargetBanner, setShowTargetBanner] = useState(false);
//   const prevTargetRef = useRef<number | null>(null);
  
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const isTestRunning = exerciseState === 'RUNNING';
  
//   const { controlValue, currentRatio, isTracked, allTimeBest, sessionTarget, setBaseline } = useHandTracking(videoRef, isTestRunning);
//   const { initAudio, playAudio, pauseAudio, updateFilter, setTrackingStatus, stopAudio, isAudioLoaded } = useAudioEngine();

//   useEffect(() => {
//     if (exerciseState === 'RUNNING' && isAudioLoaded) {
//       setTrackingStatus(isTracked);
//       updateFilter(controlValue);
//     }
//   }, [controlValue, isTracked, exerciseState, isAudioLoaded, updateFilter, setTrackingStatus]);

//   useEffect(() => {
//     if (exerciseState !== 'RUNNING' || sessionTarget === null) return;

//     // Initialize the ref on the first run
//     if (prevTargetRef.current === null) {
//       prevTargetRef.current = sessionTarget;
//       return;
//     }

//     // If the hook pushed the target higher, trigger the banner!
//     if (sessionTarget > prevTargetRef.current) {
//       setShowTargetBanner(true);
      
//       const timer = setTimeout(() => {
//         setShowTargetBanner(false);
//       }, 3000); // Hides after 3 seconds

//       // Update the ref to the new target so it doesn't re-trigger
//       prevTargetRef.current = sessionTarget; 
      
//       return () => clearTimeout(timer);
//     }
//   }, [sessionTarget, exerciseState]);

//   const handleInitHardware = async () => {
//     setExerciseState('INITIALIZING');
//     await initAudio(); // Decodes the audio, but it remains strictly paused
//     setExerciseState('CALIBRATION');
//   };

//   const handleLockBaseline = () => {
//     setBaseline(currentRatio);
//     setExerciseState('RUNNING');
//     setHasAwardedXP(false);
//     playAudio(); // Now the audio starts
//   };

//   const awardSessionXP = () => {
//     if (hasAwardedXP || !onSessionComplete) return;
//     const baseXP = 20;
//     const targetHitBonus = sessionTarget !== null && currentRatio >= sessionTarget ? 15 : 0;
//     onSessionComplete(baseXP + targetHitBonus);
//     setHasAwardedXP(true);
//   };

//   const handleExit = () => {
//     if (exerciseState === 'RUNNING') {
//       awardSessionXP();
//     }
//     stopAudio();
//     setExerciseState('IDLE');
//     setActiveExercise('MENU');
//   };

//   return (
//     <div className="flex flex-col items-center w-full max-w-4xl mx-auto text-carbonBlack-600 relative">
//       <ExerciseTargetBanner visible={showTargetBanner} newTarget={sessionTarget || 0} />
      
//       <div className="flex justify-between w-full mb-6 items-center border-b border-carbonBlack-200 pb-4">
//         <h2 className="text-2xl font-semibold text-carbonBlack-900 tracking-tight">Hand Extension Test</h2>
//         <button onClick={handleExit} className="px-4 py-2 bg-carbonBlack-100 text-carbonBlack-800 rounded-md hover:bg-carbonBlack-200 transition-colors text-sm font-medium">
//           Exit to Menu
//         </button>
//       </div>
      
//       {exerciseState === 'IDLE' && (
//         <div className="bg-white border border-carbonBlack-200 shadow-sm p-8 rounded-md w-full max-w-lg text-center mt-12">
//           <h3 className="text-lg font-medium mb-4 text-carbonBlack-900">Equipment Initialization</h3>
//           <p className="text-sm text-carbonBlack-600 mb-8 leading-relaxed">
//             This module requires webcam access. Please ensure your hand is visible.
//           </p>
//           <button onClick={handleInitHardware} className="w-full rounded-md bg-primary-500 text-brandWhite px-6 py-3 font-semibold hover:bg-primary-600 transition-colors shadow-sm">
//             Initialize Hardware
//           </button>
//         </div>
//       )}

//       {exerciseState === 'INITIALIZING' && (
//         <div className="bg-white border border-carbonBlack-200 shadow-sm p-12 rounded-md w-full max-w-lg flex flex-col items-center justify-center mt-12">
//           <Lottie animationData={loadingAnimation} loop={true} style={{ width: 150, height: 150 }} />
//           <p className="text-carbonBlack-600 font-mono mt-4 text-sm font-medium">Initializing Audio & Vision Models...</p>
//         </div>
//       )}

//       {(exerciseState === 'CALIBRATION' || exerciseState === 'RUNNING') && (
//         <div className="w-full flex flex-col md:flex-row gap-6">
//           <div className="flex-1 flex flex-col gap-4">
//             <CameraMirror videoRef={videoRef} onReady={() => setIsCamReady(true)} onError={(err) => setCamError(err)} />

//             {camError ? (
//               <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md text-sm">
//                 {camError} Please check browser permissions.
//               </div>
//             ) : (
//               <div className="flex flex-col gap-2">
//                 {exerciseState === 'CALIBRATION' ? (
//                   <div className="bg-white p-4 border border-carbonBlack-200 shadow-sm rounded-md">
//                     <p className="text-sm text-carbonBlack-700 mb-4">
//                       <strong>Calibration Phase:</strong> Stretch your hand open as far as comfortably possible. Audio is muted. Click below to lock today&apos;s baseline.
//                     </p>
//                     <button 
//                       onClick={handleLockBaseline} 
//                       disabled={!isCamReady || !isTracked}
//                       className="w-full rounded-md bg-primary-500 text-brandWhite px-4 py-3 font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
//                     >
//                       Lock Baseline & Start Test
//                     </button>
//                   </div>
//                 ) : (
//                   <button 
//                     onClick={() => {
//                       awardSessionXP();
//                       pauseAudio();
//                       stopAudio();
//                       setExerciseState('IDLE');
//                       setActiveExercise('MENU');
//                     }} 
//                     className="w-full rounded-md bg-white text-carbonBlack-800 px-6 py-3 font-semibold hover:bg-carbonBlack-50 transition-colors border border-carbonBlack-200 shadow-sm"
//                   >
//                     End Session
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Clinical Metrics Dashboard */}
//           <div className="w-full md:w-80 flex flex-col gap-4">
//             <div className={`p-3 rounded-md border text-sm font-medium shadow-sm ${isTracked ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
//               {isTracked ? 'Status: Subject in Frame' : 'Status: Awaiting Subject'}
//             </div>

//             <div className="bg-white border border-carbonBlack-200 shadow-sm p-4 rounded-md flex flex-col gap-4 relative overflow-hidden">
//               <h4 className="text-xs uppercase tracking-widest text-carbonBlack-500 font-semibold border-b border-carbonBlack-100 pb-2">Live Telemetry</h4>
              
//               <div className="flex justify-between items-center z-10">
//                 <span className="text-sm text-carbonBlack-600">Current Extension:</span>
//                 <span className="font-mono text-carbonBlack-900 font-medium">{currentRatio.toFixed(2)}</span>
//               </div>
              
//               <div className="flex justify-between items-center z-10">
//                 <span className="text-sm text-carbonBlack-600">Today&apos;s Target:</span>
//                 <span className="font-mono text-carbonBlack-900 font-medium">{sessionTarget ? sessionTarget.toFixed(2) : '---'}</span>
//               </div>
              
//               <div className="flex justify-between items-center z-10">
//                 <span className="text-sm text-carbonBlack-600">Audio Clarity:</span>
//                 <span className="font-mono text-carbonBlack-900 font-medium">{exerciseState === 'RUNNING' ? `${(controlValue * 100).toFixed(0)}%` : 'MUTED'}</span>
//               </div>

//               <div className="mt-2 pt-4 border-t border-carbonBlack-100 flex flex-col gap-2 z-10">
//                 <span className="text-xs text-carbonBlack-500 uppercase tracking-widest font-semibold">All-Time Best</span>
//                 <span className="font-mono text-xl text-primary-600 font-bold">{allTimeBest ? allTimeBest.toFixed(2) : 'No Data'}</span>
//               </div>
//             </div>

//             {/* Stretch Visualizer */}
//             {exerciseState === 'RUNNING' && sessionTarget !== null && (
//               <div className="bg-white border border-carbonBlack-200 shadow-sm p-4 rounded-md flex flex-col items-center gap-4 relative overflow-hidden">
//                 <h4 className="text-xs uppercase tracking-widest text-carbonBlack-500 font-semibold border-b border-carbonBlack-100 pb-2 w-full text-left">Stretch Visualizer</h4>
//                 <StretchIndicator currentRatio={currentRatio} sessionTarget={sessionTarget} />
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';
import { useRef, useState, useEffect } from 'react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { CameraMirror } from '@/components/CameraMirror';
import { StretchIndicator } from '@/components/exercises/StretchIndicator';
import { useSession } from '@/context/SessionContext';

import { ExerciseTargetBanner } from './ExerciseTargetBanner';
import Lottie from 'lottie-react';
import loadingAnimation from '../../../public/animations/loading.json';

type ExerciseState = 'IDLE' | 'INITIALIZING' | 'CALIBRATION' | 'RUNNING';

interface HandOpenCloseProps {
  onSessionComplete?: (xp: number) => void;
}

export default function HandOpenClose({ onSessionComplete }: HandOpenCloseProps) {
  const { setActiveExercise } = useSession();
  const [exerciseState, setExerciseState] = useState<ExerciseState>('IDLE');
  const [camError, setCamError] = useState<string | null>(null);
  const [isCamReady, setIsCamReady] = useState(false);
  const [hasAwardedXP, setHasAwardedXP] = useState(false);

  const [showTargetBanner, setShowTargetBanner] = useState(false);
  const prevTargetRef = useRef<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const isTestRunning = exerciseState === 'RUNNING';

  const { controlValue, currentRatio, isTracked, allTimeBest, sessionTarget, setBaseline } = useHandTracking(videoRef, isTestRunning);
  const { initAudio, playAudio, pauseAudio, updateFilter, setTrackingStatus, stopAudio, isAudioLoaded } = useAudioEngine();

  useEffect(() => {
    if (exerciseState === 'RUNNING' && isAudioLoaded) {
      setTrackingStatus(isTracked);
      updateFilter(controlValue);
    }
  }, [controlValue, isTracked, exerciseState, isAudioLoaded, updateFilter, setTrackingStatus]);

  useEffect(() => {
    if (exerciseState !== 'RUNNING' || sessionTarget === null) return;

    if (prevTargetRef.current === null) {
      prevTargetRef.current = sessionTarget;
      return;
    }

    if (sessionTarget > prevTargetRef.current) {
      setShowTargetBanner(true);

      const timer = setTimeout(() => {
        setShowTargetBanner(false);
      }, 3000);

      prevTargetRef.current = sessionTarget;

      return () => clearTimeout(timer);
    }
  }, [sessionTarget, exerciseState]);

  const handleInitHardware = async () => {
    setExerciseState('INITIALIZING');
    await initAudio();
    setExerciseState('CALIBRATION');
  };

  const handleLockBaseline = () => {
    setBaseline(currentRatio);
    setExerciseState('RUNNING');
    setHasAwardedXP(false);
    playAudio();
  };

  const awardSessionXP = () => {
    if (hasAwardedXP || !onSessionComplete) return;
    const baseXP = 20;
    const targetHitBonus = sessionTarget !== null && currentRatio >= sessionTarget ? 15 : 0;
    onSessionComplete(baseXP + targetHitBonus);
    setHasAwardedXP(true);
  };

  const handleExit = () => {
    if (exerciseState === 'RUNNING') {
      awardSessionXP();
    }
    stopAudio();
    setExerciseState('IDLE');
    setActiveExercise('MENU');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-full mx-auto relative">
      <ExerciseTargetBanner visible={showTargetBanner} newTarget={sessionTarget || 0} />

      {/* Page header */}
      <div className="flex justify-between w-full items-center border-b border-carbonBlack-100 pb-4 mb-8">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
            Hand Rehabilitation
          </span>
          <h2 className="text-2xl font-bold text-carbonBlack-900 tracking-[-0.02em] font-[var(--font-poppins)] leading-tight">
            Hand Extension Test
          </h2>
        </div>
        <button
          onClick={handleExit}
          className="px-4 py-2 bg-white border border-carbonBlack-200 text-carbonBlack-700 rounded-md hover:border-carbonBlack-300 hover:bg-carbonBlack-50 transition-colors text-sm font-medium font-[var(--font-work-sans)]"
        >
          Exit to Menu
        </button>
      </div>

      {/* IDLE state */}
      {exerciseState === 'IDLE' && (
        <div className="w-full max-w-lg mt-8">
          <div className="flex flex-col gap-1 mb-5">
            <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
              Step 1
            </span>
            <h3 className="text-lg font-bold text-carbonBlack-900 tracking-[-0.02em] font-[var(--font-poppins)]">
              Equipment Initialisation
            </h3>
          </div>
          <div className="bg-white border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-md p-8">
            <p className="text-sm text-carbonBlack-600 leading-relaxed mb-8 font-[var(--font-work-sans)]">
              This module requires access to your webcam. Before continuing, please ensure your hand is visible and well-lit. No video is stored or transmitted.
            </p>
            <button
              onClick={handleInitHardware}
              className="w-full rounded-md bg-primary-500 text-white px-6 py-3 font-semibold hover:bg-primary-600 transition-colors text-sm font-[var(--font-work-sans)]"
            >
              Initialise Camera &amp; Audio
            </button>
          </div>
        </div>
      )}

      {/* INITIALIZING state */}
      {exerciseState === 'INITIALIZING' && (
        <div className="w-full max-w-lg mt-8">
          <div className="bg-white border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-md p-12 flex flex-col items-center justify-center gap-4">
            <Lottie animationData={loadingAnimation} loop={true} style={{ width: 120, height: 120 }} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
                Please Wait
              </span>
              <p className="font-mono text-sm text-carbonBlack-700 font-medium">
                Loading audio and vision models…
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CALIBRATION / RUNNING state */}
      {(exerciseState === 'CALIBRATION' || exerciseState === 'RUNNING') && (
        <div className="w-full flex flex-col gap-8">

          {/* Step label */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
              {exerciseState === 'CALIBRATION' ? 'Step 2' : 'Step 3'}
            </span>
            <h3 className="text-lg font-bold text-carbonBlack-900 tracking-[-0.02em] font-[var(--font-poppins)]">
              {exerciseState === 'CALIBRATION' ? 'Baseline Calibration' : 'Live Session'}
            </h3>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: camera + action */}
            <div className="flex-1 flex flex-col gap-4">
              <CameraMirror
                videoRef={videoRef}
                onReady={() => setIsCamReady(true)}
                onError={(err) => setCamError(err)}
              />

              {camError ? (
                <div className="bg-dangerRed-50 border border-dangerRed-200 text-dangerRed-700 p-4 rounded-md text-sm font-[var(--font-work-sans)] leading-relaxed">
                  {camError} Please check your browser permissions and try again.
                </div>
              ) : exerciseState === 'CALIBRATION' ? (
                <div className="bg-white border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-md p-5">
                  <p className="text-sm text-carbonBlack-700 leading-relaxed mb-5 font-[var(--font-work-sans)]">
                    <span className="font-semibold text-carbonBlack-900">Calibration phase.</span>{' '}
                    Stretch your hand open as wide as is comfortable and hold it. Audio is muted. When you are ready, click below to lock your baseline.
                  </p>
                  <button
                    onClick={handleLockBaseline}
                    disabled={!isCamReady || !isTracked}
                    className="w-full rounded-md bg-primary-500 text-white px-4 py-3 font-semibold hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-[var(--font-work-sans)]"
                  >
                    Lock Baseline &amp; Begin Test
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    awardSessionXP();
                    pauseAudio();
                    stopAudio();
                    setExerciseState('IDLE');
                    setActiveExercise('MENU');
                  }}
                  className="w-full rounded-md bg-white text-carbonBlack-800 px-6 py-3 font-semibold hover:bg-carbonBlack-50 transition-colors border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] text-sm font-[var(--font-work-sans)]"
                >
                  End Session
                </button>
              )}
            </div>

            {/* Right: metrics panel */}
            <div className="w-full md:w-72 flex flex-col gap-4">

              {/* Tracking status */}
              <div
                className={`px-4 py-3 rounded-md border text-sm font-medium font-[var(--font-work-sans)] flex items-center gap-2 ${
                  isTracked
                    ? 'bg-successGreen-50 border-successGreen-200 text-successGreen-700'
                    : 'bg-dangerRed-50 border-dangerRed-200 text-dangerRed-700'
                }`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                    isTracked ? 'bg-successGreen-500' : 'bg-dangerRed-400'
                  }`}
                />
                {isTracked ? 'Subject in frame' : 'Awaiting subject'}
              </div>

              {/* Live telemetry */}
              <div className="bg-white border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-md p-5 flex flex-col gap-4">
                <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)] border-b border-carbonBlack-100 pb-3">
                  Live Telemetry
                </span>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-carbonBlack-600 font-[var(--font-work-sans)]">Current Extension</span>
                    <span className="font-mono text-carbonBlack-900 font-medium text-sm">{currentRatio.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-carbonBlack-600 font-[var(--font-work-sans)]">Today's Target</span>
                    <span className="font-mono text-carbonBlack-900 font-medium text-sm">
                      {sessionTarget ? sessionTarget.toFixed(2) : '—'}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-carbonBlack-600 font-[var(--font-work-sans)]">Audio Clarity</span>
                    <span className="font-mono text-carbonBlack-900 font-medium text-sm">
                      {exerciseState === 'RUNNING' ? `${(controlValue * 100).toFixed(0)}%` : 'Muted'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-carbonBlack-100 flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
                    All-Time Best
                  </span>
                  <span className="font-mono text-2xl text-primary-600 font-bold">
                    {allTimeBest ? allTimeBest.toFixed(2) : 'No data'}
                  </span>
                </div>
              </div>

              {/* Stretch visualizer */}
              {exerciseState === 'RUNNING' && sessionTarget !== null && (
                <div className="bg-white border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-md p-5 flex flex-col gap-4">
                  <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)] border-b border-carbonBlack-100 pb-3">
                    Stretch Visualiser
                  </span>
                  <StretchIndicator currentRatio={currentRatio} sessionTarget={sessionTarget} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### `src/components/exercises/StretchIndicator.tsx`
```tsx
import { Box, Flex, Group, Text, useMantineTheme } from '@mantine/core';

interface StretchIndicatorProps {
  currentRatio: number;
  sessionTarget: number;
}

export const StretchIndicator = ({ currentRatio, sessionTarget }: StretchIndicatorProps) => {
  const theme = useMantineTheme();
  const TOTAL_SEGMENTS = 30;

  // Calculate dynamic ceiling to ensure target is always visible with headroom
  const displayCeiling = Math.max(sessionTarget * 1.2, 0.5);

  // Calculate the position of the target line as a percentage from the left
  const targetLeftPercentage = Math.min((sessionTarget / displayCeiling) * 100, 100);

  // Generate segments from left (index 0) to right (index TOTAL_SEGMENTS - 1)
  const segments = Array.from({ length: TOTAL_SEGMENTS }, (_, i) => i);

  return (
    <Box bg="#FFFFFF" p="md" style={{ borderRadius: '8px', width: '100%' }}>
      {/* Stats Row */}
      <Group justify="space-between" mb="sm">
        <Text size="xs" fw={600} c="dimmed">REST</Text>
        <Text size="xs" fw={700} c="carbonBlack.9">TARGET: {sessionTarget.toFixed(2)}</Text>
        <Text size="xs" fw={600} c="dimmed">PUSH</Text>
      </Group>

      {/* Visual Indicator Container */}
      <Box h={40} w="100%" style={{ position: 'relative' }}>
        <Flex direction="row" h="100%" gap={2}>
          {segments.map((index) => {
            // The absolute value this segment represents
            const segmentValue = ((index + 1) / TOTAL_SEGMENTS) * displayCeiling;
            const isLit = currentRatio >= segmentValue;

            // Determine the color based on the segment's absolute value
            let color = '#EDEDED'; // Unlit soft light gray
            if (isLit) {
              if (segmentValue < 0.4) {
                color = theme.colors.dangerRed[5];
              } else if (segmentValue < 0.75) {
                color = theme.colors.warningAmber[5];
              } else {
                color = theme.colors.successGreen[5];
              }
            }

            return (
              <Box
                key={index}
                flex={1}
                h="100%"
                style={{
                  backgroundColor: color,
                  borderRadius: '2px',
                  transition: 'all 100ms ease-out',
                  boxShadow: isLit ? `0 0 8px ${color}40` : 'none',
                }}
              />
            );
          })}
        </Flex>

        {/* Target Line Marker */}
        <Box
          w={2}
          bg="carbonBlack.9"
          style={{
            position: 'absolute',
            top: -5,
            bottom: -5,
            left: `calc(${targetLeftPercentage}% - 1px)`,
            zIndex: 10,
            transition: 'left 300ms ease-out',
          }}
        />
        {/* Target Arrow */}
        <Box
          style={{
            position: 'absolute',
            top: -15,
            left: `calc(${targetLeftPercentage}% - 6px)`,
            color: 'var(--mantine-color-carbonBlack-7)',
            fontWeight: 'bold',
            transition: 'left 300ms ease-out',
          }}
        >
          ▼
        </Box>
      </Box>
    </Box>
  );
};
```

### `src/components/gamification/LevelBanner.tsx`
```tsx
'use client';

type LevelBannerProps = {
  visible: boolean;
  currentLevel: number;
  dailyStreak: number;
};

export function LevelBanner({ visible, currentLevel, dailyStreak }: LevelBannerProps) {
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="rounded-md border border-emerald-500 bg-primary-500 text-brandWhite px-5 py-3 shadow-lg">
        <p className="text-xs tracking-widest font-semibold">LEVEL UP</p>
        <p className="font-mono text-sm mt-1">
          Level {currentLevel} reached
          <span className="text-emerald-500"> + Streak {dailyStreak}</span>
        </p>
      </div>
    </div>
  );
}
```

### `src/components/gamification/ProgressGraph.tsx`
```tsx
// 'use client';

// import type { ChartPoint } from '@/hooks/useGamification';

// type ProgressGraphProps = {
//   data: ChartPoint[];
// };

// export function ProgressGraph({ data }: ProgressGraphProps) {
//   const maxXP = Math.max(1, ...data.map((point) => point.xpEarned));

//   return (
//     <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
//       <div className="flex items-center justify-between">
//         <p className="text-zinc-400 text-xs tracking-widest uppercase">7-Day XP</p>
//         <p className="font-mono text-xs text-zinc-300">
//           MAX {maxXP}
//         </p>
//       </div>

//       <div className="mt-4 grid grid-cols-7 gap-2 items-end h-28">
//         {data.map((point) => {
//           const heightPct = Math.max(6, (point.xpEarned / maxXP) * 100);
//           return (
//             <div key={point.date} className="flex flex-col items-center gap-2">
//               <div className="h-20 w-full flex items-end">
//                 <div
//                   className={`w-full rounded-md ${point.isToday ? 'bg-zinc-300' : 'bg-zinc-700'}`}
//                   style={{ height: `${heightPct}%` }}
//                   title={`${point.label}: ${point.xpEarned} XP`}
//                 />
//               </div>
//               <span className="text-[10px] text-zinc-400 tracking-widest">{point.label}</span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


'use client';

import { Box, Text, Group, SimpleGrid, Flex } from '@mantine/core';
import type { ChartPoint } from '@/hooks/useGamification';

type ProgressGraphProps = {
  data: ChartPoint[];
};

export function ProgressGraph({ data }: ProgressGraphProps) {
  const maxXP = Math.max(1, ...data.map((point) => point.xpEarned));

  return (
    <Box p="md">
      <Group justify="space-between" align="center">
        <Text size="xs" tt="uppercase" lts="0.1em" c="carbonBlack.4" fw={600}>
          7-Day XP
        </Text>
        <Text ff="monospace" size="xs" c="carbonBlack.5">
          MAX {maxXP}
        </Text>
      </Group>

      <SimpleGrid cols={7} spacing="xs" mt="md" h={112} style={{ alignItems: 'flex-end' }}>
        {data.map((point) => {
          const heightPct = Math.max(6, (point.xpEarned / maxXP) * 100);
          return (
            <Flex key={point.date} direction="column" align="center" gap="xs" h="100%">
              <Box h={80} w="100%" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Box
                  w="100%"
                  bg={point.isToday ? 'primary.5' : 'carbonBlack.1'}
                  style={{
                    height: `${heightPct}%`,
                    borderRadius: 'var(--mantine-radius-sm)',
                    transition: 'height 0.4s ease'
                  }}
                  title={`${point.label}: ${point.xpEarned} XP`}
                />
              </Box>
              <Text size="xs" ff="monospace" c="carbonBlack.4" lts="0.05em">
                {point.label}
              </Text>
            </Flex>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}
```

### `src/components/gamification/StreakCounter.tsx`
```tsx
// 'use client';

// type StreakCounterProps = {
//   dailyStreak: number;
// };

// export function StreakCounter({ dailyStreak }: StreakCounterProps) {
//   return (
//     <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
//       <p className="text-zinc-400 text-xs tracking-widest uppercase">Daily Streak</p>
//       <div className="mt-2 flex items-baseline gap-2">
//         <span className="font-mono text-2xl text-zinc-100">{dailyStreak}</span>
//         <span className="font-mono text-sm text-emerald-500">days</span>
//       </div>
//     </div>
//   );
// }

'use client';

import { Box, Text, Group } from '@mantine/core';

type StreakCounterProps = {
  dailyStreak: number;
};

export function StreakCounter({ dailyStreak }: StreakCounterProps) {
  return (
    <Box p="md" h="100%">
      <Text size="xs" tt="uppercase" lts="0.1em" c="carbonBlack.4" fw={600}>
        Daily Streak
      </Text>
      <Group align="baseline" gap="xs" mt="sm">
        <Text ff="monospace" size="xl" fw={700} c="carbonBlack.9">
          {dailyStreak}
        </Text>
        <Text ff="monospace" size="sm" c="successGreen.6" fw={600}>
          days
        </Text>
      </Group>
    </Box>
  );
}
```

### `src/context/SessionContext.tsx`
```tsx
'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

// Define the available exercises
export type ExerciseType = 'MENU' | 'HAND_OPEN_CLOSE' | 'WRIST_ROTATION';

interface SessionContextType {
  activeExercise: ExerciseType;
  setActiveExercise: (exercise: ExerciseType) => void;
  globalScore: number;
  setGlobalScore: (score: number) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [activeExercise, setActiveExercise] = useState<ExerciseType>('MENU');
  const [globalScore, setGlobalScore] = useState(0);

  return (
    <SessionContext.Provider value={{ activeExercise, setActiveExercise, globalScore, setGlobalScore }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}
```

### `src/hooks/useAudioEngine.ts`
```ts
import { useRef, useCallback, useState } from 'react';

const makeDistortionCurve = (amount = 20) => {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
};

export const useAudioEngine = () => {
  const audioCtx = useRef<AudioContext | null>(null);
  const sourceNode = useRef<AudioBufferSourceNode | null>(null);
  const cvNode = useRef<AudioWorkletNode | null>(null);
  const hpfNodeRef = useRef<BiquadFilterNode | null>(null);
  const lpfNodeRef = useRef<BiquadFilterNode | null>(null);
  const fallbackRatioRef = useRef(0);
  const fallbackTargetRef = useRef(0);
  const fallbackTrackedRef = useRef(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  const initAudio = useCallback(async () => {
    if (audioCtx.current) return;
    audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    try {
      const response = await fetch('/loop.mp3');
      const audioBuffer = await audioCtx.current.decodeAudioData(await response.arrayBuffer());

      sourceNode.current = audioCtx.current.createBufferSource();
      const waveShaper = audioCtx.current.createWaveShaper();
      const hpfNode = audioCtx.current.createBiquadFilter();
      const lpfNode = audioCtx.current.createBiquadFilter();
      const gainNode = audioCtx.current.createGain();
      const supportsWorklet = !!audioCtx.current.audioWorklet && typeof AudioWorkletNode !== 'undefined';

      hpfNodeRef.current = hpfNode;
      lpfNodeRef.current = lpfNode;

      sourceNode.current.buffer = audioBuffer;
      sourceNode.current.loop = true;
      // 1. Lower the distortion drive amount from 10 down to 2 or 3.
      waveShaper.curve = makeDistortionCurve(2);
      waveShaper.oversample = '2x';

      // 2. Flatten the Q value to 0.7071 (Butterworth) to prevent resonant peaking on the sweep.
      hpfNode.type = 'highpass'; hpfNode.Q.value = 0.7071; hpfNode.frequency.value = 0;
      lpfNode.type = 'lowpass'; lpfNode.Q.value = 0.7071; lpfNode.frequency.value = 0;
      gainNode.gain.value = 0.8;

      sourceNode.current.connect(waveShaper);
      waveShaper.connect(hpfNode);
      hpfNode.connect(lpfNode);
      lpfNode.connect(gainNode);
      gainNode.connect(audioCtx.current.destination);

      if (supportsWorklet) {
        await audioCtx.current.audioWorklet.addModule('/cv-processor.js');
        cvNode.current = new AudioWorkletNode(audioCtx.current, 'cv-processor', { numberOfOutputs: 2 });
        cvNode.current.connect(lpfNode.frequency, 0);
        cvNode.current.connect(hpfNode.frequency, 1);
      } else {
        // Fallback for browsers without AudioWorklet support.
        lpfNode.frequency.value = 2000;
        hpfNode.frequency.value = 1000;
      }

      sourceNode.current.start();
      // NEW: Immediately pause the audio context so it waits for the user
      await audioCtx.current.suspend();
      setIsAudioLoaded(true);
    } catch (error) {
      console.error("Audio initialization failed:", error);
    }
  }, []);

  // NEW: Explicit Play/Pause controls
  const playAudio = useCallback(async () => {
    if (audioCtx.current && audioCtx.current.state === 'suspended') {
      await audioCtx.current.resume();
    }
  }, []);

  const pauseAudio = useCallback(async () => {
    if (audioCtx.current && audioCtx.current.state === 'running') {
      await audioCtx.current.suspend();
    }
  }, []);

  const updateFilter = useCallback((value: number) => {
    if (cvNode.current) {
      cvNode.current.port.postMessage({ type: 'SET_RATIO', value });
      return;
    }

    if (!audioCtx.current || !hpfNodeRef.current || !lpfNodeRef.current) return;
    fallbackTargetRef.current = Math.max(0, Math.min(1, value));
    const delta = fallbackTargetRef.current - fallbackRatioRef.current;
    const maxRise = 0.04;
    const maxFall = 0.02;
    const lostDecay = 0.01;

    if (fallbackTrackedRef.current) {
      fallbackRatioRef.current += delta > 0 ? Math.min(maxRise, delta) : Math.max(-maxFall, delta);
    } else {
      fallbackRatioRef.current += Math.max(-lostDecay, delta);
    }

    const lpfFreq = 2000 * Math.pow(10, fallbackRatioRef.current);
    const hpfFreq = 1000 * Math.pow(0.02, fallbackRatioRef.current);
    const now = audioCtx.current.currentTime;
    lpfNodeRef.current.frequency.setTargetAtTime(lpfFreq, now, 0.03);
    hpfNodeRef.current.frequency.setTargetAtTime(hpfFreq, now, 0.03);
  }, []);

  const setTrackingStatus = useCallback((status: boolean) => {
    if (cvNode.current) {
      cvNode.current.port.postMessage({ type: 'SET_TRACKING', value: status });
      return;
    }
    fallbackTrackedRef.current = status;
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceNode.current) { try { sourceNode.current.stop(); } catch (e) { } sourceNode.current.disconnect(); }
    if (cvNode.current) cvNode.current.disconnect();
    cvNode.current = null;
    hpfNodeRef.current = null;
    lpfNodeRef.current = null;
    fallbackRatioRef.current = 0;
    fallbackTargetRef.current = 0;
    fallbackTrackedRef.current = false;
    if (audioCtx.current) { audioCtx.current.close(); audioCtx.current = null; }
    setIsAudioLoaded(false);
  }, []);

  return { initAudio, playAudio, pauseAudio, updateFilter, setTrackingStatus, stopAudio, isAudioLoaded };
};
```

### `src/hooks/useGamification.ts`
```ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'physio_gamification_v1';
const XP_LEVEL_DIVISOR = 100;
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

type HistoryEntry = {
  date: string;
  xpEarned: number;
};

type GamificationState = {
  currentLevel: number;
  currentXP: number;
  dailyStreak: number;
  lastActiveDate: string | null;
  history: HistoryEntry[];
};

export type ChartPoint = {
  date: string;
  label: string;
  xpEarned: number;
  isToday: boolean;
};

const defaultState: GamificationState = {
  currentLevel: 0,
  currentXP: 0,
  dailyStreak: 0,
  lastActiveDate: null,
  history: [],
};

const getTodayISODate = () => new Date().toISOString().split('T')[0];

const toDateOnly = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const daysBetween = (fromISO: string, toISO: string) => {
  const from = toDateOnly(fromISO);
  const to = toDateOnly(toISO);
  if (!from || !to) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
};

const calcTotalXP = (history: HistoryEntry[]) =>
  history.reduce((sum, entry) => sum + entry.xpEarned, 0);

const calcLevelFromTotalXP = (totalXP: number) =>
  Math.floor(Math.sqrt(Math.max(totalXP, 0) / XP_LEVEL_DIVISOR));

const calcXPWithinLevel = (totalXP: number, level: number) => {
  const levelFloor = Math.pow(level, 2) * XP_LEVEL_DIVISOR;
  return Math.max(0, totalXP - levelFloor);
};

export const useGamification = () => {
  const [state, setState] = useState<GamificationState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasLeveledUp, setHasLeveledUp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GamificationState>;
        setState((prev) => ({
          ...prev,
          ...parsed,
          history: Array.isArray(parsed.history) ? parsed.history : prev.history,
        }));
      }
    } catch {
      setState(defaultState);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isHydrated]);

  const checkAndUpdateStreak = useCallback(() => {
    const today = getTodayISODate();
    setState((prev) => {
      if (!prev.lastActiveDate || prev.lastActiveDate === today) return prev;
      const diff = daysBetween(prev.lastActiveDate, today);
      if (diff === null || diff <= 1) return prev;
      return { ...prev, dailyStreak: 0 };
    });
  }, []);

  const addXP = useCallback((amount: number) => {
    if (amount <= 0) return;
    const today = getTodayISODate();

    setState((prev) => {
      const nextHistory = [...prev.history];
      const todayIdx = nextHistory.findIndex((entry) => entry.date === today);
      if (todayIdx >= 0) {
        nextHistory[todayIdx] = {
          ...nextHistory[todayIdx],
          xpEarned: nextHistory[todayIdx].xpEarned + amount,
        };
      } else {
        nextHistory.push({ date: today, xpEarned: amount });
      }

      const previousLevel = prev.currentLevel;
      const totalXP = calcTotalXP(nextHistory);
      const nextLevel = calcLevelFromTotalXP(totalXP);
      const nextCurrentXP = calcXPWithinLevel(totalXP, nextLevel);

      const diff = prev.lastActiveDate ? daysBetween(prev.lastActiveDate, today) : null;
      const nextStreak =
        prev.lastActiveDate === today
          ? prev.dailyStreak
          : diff === 1 || prev.lastActiveDate === null
            ? Math.max(1, prev.dailyStreak + 1)
            : 1;

      if (nextLevel > previousLevel) {
        setHasLeveledUp(true);
        window.setTimeout(() => setHasLeveledUp(false), 2800);
      }

      return {
        currentLevel: nextLevel,
        currentXP: nextCurrentXP,
        dailyStreak: nextStreak,
        lastActiveDate: today,
        history: nextHistory.slice(-90),
      };
    });
  }, []);

  const getChartData = useCallback((): ChartPoint[] => {
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - (6 - idx));
      return d.toISOString().split('T')[0];
    });

    const xpMap = new Map(state.history.map((entry) => [entry.date, entry.xpEarned]));
    const todayISO = getTodayISODate();

    return dates.map((dateISO) => ({
      date: dateISO,
      label: WEEKDAY_LABELS[new Date(`${dateISO}T00:00:00.000Z`).getUTCDay()],
      xpEarned: xpMap.get(dateISO) ?? 0,
      isToday: dateISO === todayISO,
    }));
  }, [state.history]);

  useEffect(() => {
    if (!isHydrated) return;
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak, isHydrated]);

  const totalXP = useMemo(() => calcTotalXP(state.history), [state.history]);
  const nextLevelXP = useMemo(() => Math.pow(state.currentLevel + 1, 2) * XP_LEVEL_DIVISOR, [state.currentLevel]);
  const currentLevelFloorXP = useMemo(() => Math.pow(state.currentLevel, 2) * XP_LEVEL_DIVISOR, [state.currentLevel]);
  const xpToNextLevel = Math.max(0, nextLevelXP - totalXP);
  const progressInLevel = nextLevelXP === currentLevelFloorXP
    ? 0
    : ((totalXP - currentLevelFloorXP) / (nextLevelXP - currentLevelFloorXP)) * 100;

  return {
    ...state,
    isHydrated,
    totalXP,
    xpToNextLevel,
    progressInLevel: Math.max(0, Math.min(100, progressInLevel)),
    hasLeveledUp,
    addXP,
    checkAndUpdateStreak,
    getChartData,
  };
};
```

### `src/hooks/useHandTracking.ts`
```ts
import { useEffect, useRef, useState } from 'react';

export const useHandTracking = (videoRef: React.RefObject<HTMLVideoElement | null>, isTestRunning: boolean) => {
  const [controlValue, setControlValue] = useState<number>(0);
  const [currentRatio, setCurrentRatio] = useState<number>(0); 
  const [isTracked, setIsTracked] = useState<boolean>(false);
  
  // Split the logic: Today's goal vs Historical Best
  const [allTimeBest, setAllTimeBest] = useState<number | null>(null); 
  const [sessionTarget, setSessionTarget] = useState<number | null>(null);
  const [hasLeveledUp, setHasLeveledUp] = useState<boolean>(false);

  const minRatio = useRef(0.8); 

  const medianHistory = useRef<number[]>([]);
  const smoothHistory = useRef<number[]>([]);
  const lastSeenTime = useRef<number>(0);

  // Load historical best on mount
  useEffect(() => {
    const savedBest = localStorage.getItem('physio_pb_hand_extension');
    if (savedBest) setAllTimeBest(parseFloat(savedBest));
  }, []);

  // Set today's specific baseline (Silent Calibration Phase)
  const setBaseline = (baseline: number) => {
    setSessionTarget(baseline * 1.05); // Today's target is 5% harder than today's stretch
  };

  useEffect(() => {
    let handsModel: any = null;
    let animationFrameId: number;
    let isProcessing = false;
    let lastProcessTime = 0;

    const startHands = async () => {
      while (!(window as any).Hands) await new Promise(r => setTimeout(r, 100));
      const Hands = (window as any).Hands;
      handsModel = new Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
      handsModel.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

      handsModel.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          lastSeenTime.current = performance.now();
          if (!isTracked) setIsTracked(true);

          const landmarks = results.multiHandLandmarks[0];
          const calcDist3D = (p1: any, p2: any) => Math.hypot(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
          
          let palmLength = calcDist3D(landmarks[0], landmarks[9]);
          if (palmLength === 0) palmLength = 0.001;
          const rawRatio = calcDist3D(landmarks[0], landmarks[12]) / palmLength;

          medianHistory.current.push(rawRatio);
          if (medianHistory.current.length > 3) medianHistory.current.shift();
          const sorted = [...medianHistory.current].sort((a, b) => a - b);
          const filteredRatio = sorted.length === 3 ? sorted[1] : rawRatio;

          smoothHistory.current.push(filteredRatio);
          if (smoothHistory.current.length > 2) smoothHistory.current.shift();
          const smoothedRatio = smoothHistory.current.reduce((a, b) => a + b, 0) / smoothHistory.current.length;
          
          setCurrentRatio(smoothedRatio);

          // Calculate audio map based on TODAY'S target, not all-time best
          const activeTarget = sessionTarget !== null ? sessionTarget : 2.5;
          const mappedValue = Math.max(0.0, Math.min(1.0, 
            (smoothedRatio - minRatio.current) / (activeTarget - minRatio.current)
          ));
          setControlValue(mappedValue);

          // Progressive Overload Logic (Only runs during the actual test)
          if (isTestRunning && sessionTarget !== null && sorted.length === 3) {
            
            // 1. Push today's goalpost if they beat it
            if (smoothedRatio > sessionTarget) {
              setSessionTarget(smoothedRatio * 1.05); 
            }

            // 2. Did they beat their ALL-TIME historical best?
            if (allTimeBest === null || smoothedRatio > allTimeBest) {
              setAllTimeBest(smoothedRatio);
              localStorage.setItem('physio_pb_hand_extension', smoothedRatio.toString());
              setHasLeveledUp(true);
              setTimeout(() => setHasLeveledUp(false), 3000);
            }
          }

        } else {
          if (isTracked && performance.now() - lastSeenTime.current > 800) setIsTracked(false);
        }
      });

      const processVideo = async () => {
        if (performance.now() - lastProcessTime >= 1000/15 && videoRef.current && videoRef.current.readyState >= 2 && !isProcessing) {
          isProcessing = true;
          lastProcessTime = performance.now();
          try { await handsModel.send({ image: videoRef.current }); } 
          catch (e) {} finally { isProcessing = false; }
        }
        animationFrameId = requestAnimationFrame(processVideo);
      };
      processVideo();
    };

    startHands();
    return () => { if (handsModel) handsModel.close(); if (animationFrameId) cancelAnimationFrame(animationFrameId); };
  }, [videoRef, isTracked, isTestRunning, sessionTarget, allTimeBest]); 

  return { controlValue, currentRatio, isTracked, allTimeBest, sessionTarget, hasLeveledUp, setBaseline };
};
```

### `src/hooks/usePoseDetection.ts`
```ts
import { useEffect, useRef, useState } from 'react';
import { ExponentialSmoothing } from '../utils/smoothing';

export const usePoseDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [yCoord, setYCoord] = useState<number>(0);
  const smoother = useRef(new ExponentialSmoothing(0.15));

  useEffect(() => {
    let pose: any = null;
    let animationFrameId: number;
    let isProcessing = false; // The lock to prevent Promise crashing

    const startPose = async () => {
      // Wait for the CDN script to attach to the window object
      while (!(window as any).Pose) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const Pose = (window as any).Pose;

      pose = new Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1, 
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results: any) => {
        if (results.poseLandmarks && results.poseLandmarks[16]) {
          // Landmark 16 is Right Wrist. Invert so moving hand UP = higher number.
          const rawY = 1 - results.poseLandmarks[16].y;
          setYCoord(smoother.current.smooth(rawY));
        }
      });

      const processVideo = async () => {
        // Only send a frame if the previous frame is completely finished
        if (videoRef.current && videoRef.current.readyState >= 2 && !isProcessing) {
          isProcessing = true;
          try {
            await pose.send({ image: videoRef.current });
          } catch (e) {
            console.warn("MediaPipe loading frame skipped...");
          }
          isProcessing = false;
        }
        animationFrameId = requestAnimationFrame(processVideo);
      };

      processVideo();
    };

    startPose();

    return () => {
      if (pose) pose.close();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [videoRef]);

  return yCoord;
};
```

### `src/utils/smoothing.ts`
```ts
export class ExponentialSmoothing {
  private previousValue: number | null = null;
  private alpha: number;

  constructor(alpha: number = 0.15) {
    this.alpha = alpha;
  }

  // Formula: St = α * Xt + (1 - α) * St-1
  smooth(newValue: number): number {
    if (this.previousValue === null) {
      this.previousValue = newValue;
      return newValue;
    }
    const smoothed = this.alpha * newValue + (1 - this.alpha) * this.previousValue;
    this.previousValue = smoothed;
    return smoothed;
  }
}
```

### `package.json`
```json
{
  "name": "physio-cv-poc",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@mantine/core": "^9.1.0",
    "@mantine/hooks": "^9.1.0",
    "@mediapipe/drawing_utils": "^0.3.1675466124",
    "@mediapipe/hands": "^0.4.1675469240",
    "@mediapipe/pose": "^0.5.1675469404",
    "@tabler/icons-react": "^3.41.1",
    "@tensorflow/tfjs-backend-webgl": "^4.22.0",
    "@tensorflow/tfjs-core": "^4.22.0",
    "lottie-react": "^2.4.1",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-plugin-react-compiler": "1.0.0",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "postcss-preset-mantine": "^1.18.0",
    "postcss-simple-vars": "^7.0.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

### `next.config.ts`
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
```

### `postcss.config.mjs`
```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
      },
    },
  },
};

export default config;
```

### `eslint.config.mjs`
```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

### `next-env.d.ts`
```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

### `public/cv-processor.js`
```js
class CVProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRatio = 0;
    this.currentRatio = 0;
    this.isTracked = false;

    this.port.onmessage = (event) => {
      if (event.data.type === 'SET_RATIO') this.targetRatio = event.data.value;
      else if (event.data.type === 'SET_TRACKING') this.isTracked = event.data.value;
    };
  }

  process(inputs, outputs) {
    // We will use Output 0 for the Low-Pass CV, and Output 1 for the High-Pass CV
    const outLPF = outputs[0];
    const outHPF = outputs[1];

    const maxRise = 0.0001;  
    const maxFall = 0.00005; 
    const lostDecay = 0.00002;

    const actualTarget = this.isTracked ? this.targetRatio : 0.0;

    for (let i = 0; i < outLPF[0].length; ++i) {
      const delta = actualTarget - this.currentRatio;

      if (this.isTracked) {
        if (delta > 0) this.currentRatio += Math.min(maxRise, delta);
        else this.currentRatio += Math.max(-maxFall, delta);
      } else {
        this.currentRatio += Math.max(-lostDecay, delta);
      }

      // Map CV to Frequencies
      // LPF: Opens upwards from 2000Hz to 20000Hz exponentially
      const lpfFreq = 2000 * Math.pow(10, this.currentRatio); 
      // HPF: Opens downwards from 1000Hz down to 20Hz exponentially
      const hpfFreq = 1000 * Math.pow(0.02, this.currentRatio); 

      // Send to all channels of their respective outputs
      for (let c = 0; c < outLPF.length; ++c) outLPF[c][i] = lpfFreq;
      if (outHPF) {
        for (let c = 0; c < outHPF.length; ++c) outHPF[c][i] = hpfFreq;
      }
    }
    return true; 
  }
}
registerProcessor('cv-processor', CVProcessor);
```

