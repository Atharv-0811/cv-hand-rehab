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