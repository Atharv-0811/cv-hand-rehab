'use client';
import { useSession } from '@/context/SessionContext';
import { Title, Text, Group, Box, Stack, SimpleGrid, UnstyledButton, Container } from '@mantine/core';
import HandOpenClose from '@/components/exercises/HandOpenClose';
import { useGamification } from '@/hooks/useGamification';
import { LevelBanner } from '@/components/gamification/LevelBanner';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { ProgressGraph } from '@/components/gamification/ProgressGraph';

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

  return (
    <Box component="main" bg="#FFFDF5" mih="100vh" py="xl" px="md">
      <LevelBanner visible={hasLeveledUp} currentLevel={currentLevel} dailyStreak={dailyStreak} />
      <Container size="md">
        <Group justify="space-between" mb="md3" pb="sm3" style={{ borderBottom: '1px solid var(--mantine-color-carbonBlack-1)' }}>
          <Title order={1} fw={700} c="carbonBlack.9" lts="-0.02em">
            Hand Rehab using Auditory Feedback
          </Title>
          <Group gap="xs" bg="primary.0" px="md" py="xs" style={{ borderRadius: '100px', border: '1px solid var(--mantine-color-primary-2)' }}>
            <Text size="sm" c="carbonBlack.5" tt="uppercase" lts="0.05em" fw={500}>Total Score</Text>
            <Text size="xl" fw={700} c="primary.8">{globalScore}</Text>
          </Group>
        </Group>

        {activeExercise === 'MENU' && (
          <Box className="fade-in">
            <Text size="xl" c="carbonBlack.8" mb="sm3" fw={500}>Select Today&apos;s Routine</Text>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm3">
              <UnstyledButton
                onClick={() => setActiveExercise('HAND_OPEN_CLOSE')}
                p="sm3"
                bg="#FFFDF5"
                style={{
                  border: '1px solid var(--mantine-color-carbonBlack-2)',
                  borderRadius: 'var(--mantine-radius-md)',
                  transition: 'all 0.2s ease',
                }}
                className="hover-card"
              >
                <Stack gap="xs">
                  <Box
                    w={48} h={48}
                    bg="primary.1"
                    c="primary.9"
                    style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}
                  >
                    🖐
                  </Box>
                  <Title order={3} size="lg" c="carbonBlack.9">Hand Extension</Title>
                  <Text size="sm" c="carbonBlack.6" style={{ lineHeight: 1.6 }}>
                    Focuses on finger mobility and palm stretching. Uses audio-filtered feedback.
                  </Text>
                </Stack>
              </UnstyledButton>

              <UnstyledButton
                disabled
                p="sm3"
                bg="carbonBlack.0"
                style={{
                  border: '1px solid var(--mantine-color-carbonBlack-1)',
                  borderRadius: 'var(--mantine-radius-md)',
                  opacity: 0.6,
                  cursor: 'not-allowed',
                }}
              >
                <Stack gap="xs">
                  <Box
                    w={48} h={48}
                    bg="carbonBlack.1"
                    c="carbonBlack.4"
                    style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}
                  >
                    🔄
                  </Box>
                  <Title order={3} size="lg" c="carbonBlack.4">Wrist Rotation</Title>
                  <Text size="sm" c="carbonBlack.4" style={{ lineHeight: 1.6 }}>
                    Coming soon. Focuses on pronation and supination of the forearm.
                  </Text>
                </Stack>
              </UnstyledButton>
            </SimpleGrid>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-zinc-400 text-xs uppercase tracking-widest">Progression</p>
                <div className="mt-3 flex justify-between items-end">
                  <span className="font-mono text-zinc-100 text-2xl">Level {currentLevel}</span>
                  <span className="font-mono text-zinc-300 text-sm">{currentXP} XP</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-md bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-md bg-zinc-300" style={{ width: `${Math.max(2, progressInLevel)}%` }} />
                </div>
                <p className="mt-2 text-xs text-zinc-400 font-mono tracking-widest">{xpToNextLevel} XP TO NEXT LEVEL</p>
              </div>
              <StreakCounter dailyStreak={dailyStreak} />
            </div>

            <div className="mt-4">
              <ProgressGraph data={chartData} />
            </div>
          </Box>
        )}

        {activeExercise === 'HAND_OPEN_CLOSE' && <HandOpenClose onSessionComplete={addXP} />}
      </Container>
    </Box>
  );
}