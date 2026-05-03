'use client';

import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { Paper, Title, Text, Group, Stack, RingProgress, Center, Loader, Box } from '@mantine/core';

export function AnalyticsDashboard() {
  const { summary, loading, error } = useUserAnalytics();

  if (loading) {
    return (
      <Paper withBorder radius="md" p="md" style={{ borderColor: 'var(--mantine-color-carbonBlack-2)' }}>
        <Center>
          <Loader size="sm" color="primary.5" />
        </Center>
      </Paper>
    );
  }

  if (error || !summary) {
    return (
      <Paper withBorder radius="md" p="md" style={{ borderColor: 'var(--mantine-color-dangerRed-2)' }} bg="dangerRed.0">
        <Text size="sm" c="dangerRed.7">Could not load analytics. Make sure you are logged in.</Text>
      </Paper>
    );
  }

  const { totalXp, byExercise } = summary;

  // Simple color mapping for exercises
  const getExerciseColor = (type: string) => {
    switch (type) {
      case 'HAND_OPEN_CLOSE': return 'primary.5';
      case 'PINCER_GRIP': return 'tealBrand.5';
      case 'SEQUENTIAL_PINCH': return 'warningAmber.5';
      default: return 'carbonBlack.4';
    }
  };

  const getExerciseLabel = (type: string) => {
    switch (type) {
      case 'HAND_OPEN_CLOSE': return 'Hand Extension';
      case 'PINCER_GRIP': return 'Arpeggio Path';
      case 'SEQUENTIAL_PINCH': return 'Sequential Pinch';
      default: return type;
    }
  };

  const ringSections = Object.entries(byExercise).map(([type, xp]) => ({
    value: totalXp > 0 ? (xp / totalXp) * 100 : 0,
    color: getExerciseColor(type),
    tooltip: `${getExerciseLabel(type)}: ${xp} XP`
  }));

  return (
    <Paper shadow="xs" radius="md" p="md" withBorder style={{ borderColor: 'var(--mantine-color-carbonBlack-2)' }}>
      <Title order={4} fw={700} c="carbonBlack.9" mb="md">Session Analytics</Title>

      <Group align="flex-start" wrap="nowrap">
        <RingProgress
          size={120}
          thickness={12}
          roundCaps
          sections={ringSections.length > 0 ? ringSections : [{ value: 100, color: 'carbonBlack.1' }]}
          label={
            <Text ta="center" fw={700} size="sm" c="carbonBlack.7">
              {totalXp} XP
            </Text>
          }
        />

        <Stack gap="xs" style={{ flex: 1 }}>
          {Object.entries(byExercise).length === 0 ? (
            <Text size="sm" c="dimmed">No exercises logged yet.</Text>
          ) : (
            Object.entries(byExercise).map(([type, xp]) => (
              <Group key={type} justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap">
                  <Box w={12} h={12} style={{ borderRadius: '50%', backgroundColor: `var(--mantine-color-${getExerciseColor(type).replace('.', '-')})` }} />
                  <Text size="sm" fw={500} c="carbonBlack.8" truncate>
                    {getExerciseLabel(type)}
                  </Text>
                </Group>
                <Text size="sm" fw={700} c="carbonBlack.7" ff="monospace">
                  {xp} XP
                </Text>
              </Group>
            ))
          )}
        </Stack>
      </Group>
    </Paper>
  );
}
