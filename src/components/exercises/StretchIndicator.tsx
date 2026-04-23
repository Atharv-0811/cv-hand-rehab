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
