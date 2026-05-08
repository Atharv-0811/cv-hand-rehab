'use client';

import {
  Box,
  Container,
  Group,
  Stack,
  Text,
  Title,
  Paper,
  RingProgress,
  Menu,
  ActionIcon,
} from '@mantine/core';
import {
  IconFlame,
  IconStars,
  IconChevronDown,
  IconLogout,
  IconUser,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useGamificationContext } from '@/context/GamificationContext';
import { logout } from '@/app/login/actions';

interface NavbarProps {
  displayName: string | null;
}

export function Navbar({ displayName }: NavbarProps) {
  const {
    currentLevel,
    currentXP,
    dailyStreak,
    xpToNextLevel,
    progressInLevel,
  } = useGamificationContext();

  return (
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
      <Container size="full">
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
              {displayName ? `Welcome back, ${displayName}!` : 'Auditory Feedback Training'}
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
              py="xs"
              style={{ borderColor: 'var(--mantine-color-primary-2)', background: 'var(--mantine-color-primary-0)' }}
            >
              <Group gap="md" align="center">
                <Group gap="xs" align="center">
                  <IconStars size={18} color="var(--mantine-color-primary-7)" />
                  <Stack gap={0}>
                    <Text fw={800} size="sm" c="primary.8" style={{ fontFamily: 'var(--font-poppins, sans-serif)', lineHeight: 1 }}>
                      Level {currentLevel}
                    </Text>
                    <Text size="10px" fw={600} c="primary.6" tt="uppercase" lts="0.05em">
                      {currentXP} / {currentXP + xpToNextLevel} XP
                    </Text>
                  </Stack>
                </Group>
                <RingProgress
                  size={34}
                  thickness={4}
                  roundCaps
                  sections={[{ value: Math.max(2, progressInLevel), color: 'var(--mantine-color-primary-5)' }]}
                />
              </Group>
            </Paper>

            {/* User Dropdown */}
            <Menu position="bottom-end" shadow="md" width={200} transitionProps={{ transition: 'pop-top-right' }}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="carbonBlack.6" size="lg" radius="md">
                  <IconChevronDown size={20} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Settings</Menu.Label>
                <Menu.Item component={Link} href="/profile" leftSection={<IconUser size={16} />}>
                  Profile
                </Menu.Item>
                <form action={logout}>
                  <Menu.Item type="submit" leftSection={<IconLogout size={16} />}>
                    Sign out
                  </Menu.Item>
                </form>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
