'use client';
import { useSession } from '@/context/SessionContext';
import { Title, Text, Group, Box, Stack, SimpleGrid, UnstyledButton, Container } from '@mantine/core';
import HandOpenClose from '@/components/exercises/HandOpenClose';

export default function Dashboard() {
  const { activeExercise, setActiveExercise, globalScore } = useSession();

  return (
    <Box component="main" bg="slate.9" mih="100vh" py="xl" px="md">
      <Container size="md">
        {/* Header Area */}
        <Group justify="space-between" mb="md3" pb="sm3" style={{ borderBottom: '1px solid var(--mantine-color-slate-8)' }}>
          <Title order={1} fw={700} c="slate.0" lts="-0.02em">
            Hand Rehab using Auditory Feedback
          </Title>
          <Group gap="xs" bg="slate.8" px="md" py="xs" style={{ borderRadius: '100px', border: '1px solid var(--mantine-color-slate-7)' }}>
            <Text size="sm" c="slate.4" tt="uppercase" lts="0.05em" fw={500}>Total Score</Text>
            <Text size="xl" fw={700} c="warningAmber.5">{globalScore}</Text>
          </Group>
        </Group>

        {/* Dynamic Rendering Area */}
        {activeExercise === 'MENU' && (
          <Box style={{ animation: 'fade-in 0.5s ease-out' }}>
            <Text size="xl" c="slate.2" mb="sm3" fw={500}>Select Today's Routine</Text>
            
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm3">
              
              {/* Active Module */}
              <UnstyledButton 
                onClick={() => setActiveExercise('HAND_OPEN_CLOSE')}
                p="sm3"
                bg="slate.8"
                style={{ 
                  border: '1px solid var(--mantine-color-slate-7)',
                  borderRadius: 'var(--mantine-radius-md)',
                  transition: 'all 0.2s ease',
                }}
                className="hover-card"
              >
                <Stack gap="xs">
                  <Box 
                    w={48} h={48} 
                    bg="tealBrand.9" 
                    c="tealBrand.2" 
                    style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '24px' }}
                  >
                    🖐
                  </Box>
                  <Title order={3} size="lg" c="white">Hand Extension</Title>
                  <Text size="sm" c="slate.4" style={{ lineHeight: 1.6 }}>
                    Focuses on finger mobility and palm stretching. Uses audio-filtered feedback.
                  </Text>
                </Stack>
              </UnstyledButton>

              {/* Locked/Future Module Placeholder */}
              <UnstyledButton 
                disabled
                p="sm3"
                bg="slate.9"
                style={{ 
                  border: '1px solid var(--mantine-color-slate-8)',
                  borderRadius: 'var(--mantine-radius-md)',
                  opacity: 0.5,
                  cursor: 'not-allowed'
                }}
              >
                <Stack gap="xs">
                  <Box 
                    w={48} h={48} 
                    bg="slate.8" 
                    c="slate.5" 
                    style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '24px' }}
                  >
                    🔄
                  </Box>
                  <Title order={3} size="lg" c="white">Wrist Rotation</Title>
                  <Text size="sm" c="slate.5" style={{ lineHeight: 1.6 }}>
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
          border-color: var(--mantine-color-tealBrand-5) !important;
          background-color: var(--mantine-color-slate-7) !important;
          transform: translateY(-4px);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}