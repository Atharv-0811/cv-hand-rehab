'use client';
import { useSession } from '@/context/SessionContext';
import { Title, Text, Group, Box, Stack, SimpleGrid, UnstyledButton, Container } from '@mantine/core';
import HandOpenClose from '@/components/exercises/HandOpenClose';

export default function Dashboard() {
  const { activeExercise, setActiveExercise, globalScore } = useSession();

  return (
    <Box component="main" bg="#FFFDF5" mih="100vh" py="xl" px="md">
      <Container size="md">
        {/* Header Area */}
        <Group justify="space-between" mb="md3" pb="sm3" style={{ borderBottom: '1px solid var(--mantine-color-carbonBlack-1)' }}>
          <Title order={1} fw={700} c="carbonBlack.9" lts="-0.02em">
            Hand Rehab using Auditory Feedback
          </Title>
          <Group gap="xs" bg="primary.0" px="md" py="xs" style={{ borderRadius: '100px', border: '1px solid var(--mantine-color-primary-2)' }}>
            <Text size="sm" c="carbonBlack.5" tt="uppercase" lts="0.05em" fw={500}>Total Score</Text>
            <Text size="xl" fw={700} c="primary.8">{globalScore}</Text>
          </Group>
        </Group>

        {/* Dynamic Rendering Area */}
        {activeExercise === 'MENU' && (
          <Box style={{ animation: 'fade-in 0.5s ease-out' }}>
            <Text size="xl" c="carbonBlack.8" mb="sm3" fw={500}>Select Today's Routine</Text>
            
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm3">
              
              {/* Active Module */}
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
                    style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '24px' }}
                  >
                    🖐
                  </Box>
                  <Title order={3} size="lg" c="carbonBlack.9">Hand Extension</Title>
                  <Text size="sm" c="carbonBlack.6" style={{ lineHeight: 1.6 }}>
                    Focuses on finger mobility and palm stretching. Uses audio-filtered feedback.
                  </Text>
                </Stack>
              </UnstyledButton>

              {/* Locked/Future Module Placeholder */}
              <UnstyledButton 
                disabled
                p="sm3"
                bg="carbonBlack.0"
                style={{ 
                  border: '1px solid var(--mantine-color-carbonBlack-1)',
                  borderRadius: 'var(--mantine-radius-md)',
                  opacity: 0.6,
                  cursor: 'not-allowed'
                }}
              >
                <Stack gap="xs">
                  <Box 
                    w={48} h={48} 
                    bg="carbonBlack.1" 
                    c="carbonBlack.4" 
                    style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '24px' }}
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
          </Box>
        )}

        {/* Render the specific exercise component if selected */}
        {activeExercise === 'HAND_OPEN_CLOSE' && <HandOpenClose />}
      </Container>

      <style jsx global>{`
        .hover-card:hover {
          border-color: var(--mantine-color-primary-5) !important;
          background-color: var(--mantine-color-primary-0) !important;
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}