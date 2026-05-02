'use client';

import { Transition, Box, Text, Group, ThemeIcon } from '@mantine/core';
import Lottie from 'lottie-react';
import celebrationAnimation from '../../../public/animations/celebration.json';

export type CelebrationBannerProps = {
  visible: boolean;
  title: string;
  subtitle: string;
  valueText: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
};

export function GlobalCelebrationBanner({ 
  visible, 
  title, 
  subtitle, 
  valueText, 
  icon = '🔥',
  color = 'tealBrand'
}: CelebrationBannerProps) {
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
            {visible && (
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
            )}

            {/* Banner UI Layer */}
            <Box
              bg="#FFFFFF"
              px="xl"
              py="sm"
              style={{
                border: `2px solid var(--mantine-color-${color}-5)`,
                borderRadius: 'var(--mantine-radius-md)',
                boxShadow: '0 8px 30px rgba(15, 76, 92, 0.15)',
                zIndex: 1, 
                position: 'relative' 
              }}
            >
              <Group gap="md">
                <ThemeIcon color={`${color}.1`} c={`${color}.8`} size="lg" radius="md">
                  {icon}
                </ThemeIcon>
                <Box>
                  <Text size="xs" tt="uppercase" lts="0.1em" c={`${color}.7`} fw={800}>
                    {title}
                  </Text>
                  <Text ff="monospace" size="sm" c="carbonBlack.7" mt={2}>
                    {subtitle} <Text component="span" fw={700} c={`${color}.6`}>{valueText}</Text>
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
