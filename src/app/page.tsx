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