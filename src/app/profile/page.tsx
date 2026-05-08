'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Text,
  Title,
  Group,
  Avatar,
  Stack,
  SimpleGrid,
  Skeleton,
  Table,
  Badge,
  Box,
} from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { Navbar } from '@/components/Navbar';
import '@mantine/charts/styles.css';
import { createClient } from '@/utils/supabase/client';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch exercise logs
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setProfile({
        ...profileData,
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url,
      });

      if (!sessionsError && sessionsData) {
        setSessions(sessionsData);
      }
      
      setLoading(false);
    }

    loadData();
  }, []);

  // Compute metrics
  const totalSessions = sessions.length;
  const maxXP = totalSessions > 0 
    ? Math.max(...sessions.map(s => s.xp_earned || 0)) 
    : 0;
  const avgXP = totalSessions > 0 
    ? (sessions.reduce((acc, s) => acc + (s.xp_earned || 0), 0) / totalSessions) 
    : 0;

  // Chart data (last 10 sessions, chronological order for the chart)
  const chartData = sessions
    .slice(0, 10)
    .reverse()
    .map(s => ({
      date: new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      xp_earned: s.xp_earned || 0,
    }));

  // Table data (last 5 sessions)
  const recentSessions = sessions.slice(0, 5);

  if (loading) {
    return (
      <Box bg="#FFFDF5" style={{ minHeight: '100vh' }}>
        <Container size="md" py="xl">
          <Stack gap="xl">
          <Skeleton height={120} radius="md" style={{ '--skeleton-color': 'var(--mantine-color-carbonBlack-2)' } as any} />
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Skeleton height={100} radius="md" style={{ '--skeleton-color': 'var(--mantine-color-carbonBlack-2)' } as any} />
            <Skeleton height={100} radius="md" style={{ '--skeleton-color': 'var(--mantine-color-carbonBlack-2)' } as any} />
            <Skeleton height={100} radius="md" style={{ '--skeleton-color': 'var(--mantine-color-carbonBlack-2)' } as any} />
          </SimpleGrid>
          <Skeleton height={300} radius="md" style={{ '--skeleton-color': 'var(--mantine-color-carbonBlack-2)' } as any} />
            <Skeleton height={200} radius="md" style={{ '--skeleton-color': 'var(--mantine-color-carbonBlack-2)' } as any} />
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="#FFFDF5" style={{ minHeight: '100vh' }}>
      <Navbar displayName={profile?.display_name || null} />
      <Container size="md" py="xl">
        <Stack gap="xl">
          
          {/* User Header */}
        <Paper withBorder radius="md" p="md" style={{ borderColor: 'var(--mantine-color-carbonBlack-1)' }}>
          <Group gap="md">
            <Avatar src={profile?.avatar_url} size="xl" radius="md" color="primary" />
            <Stack gap={2}>
              <Title order={2} fw={600} c="carbonBlack.9" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
                {profile?.display_name || 'Patient'}
              </Title>
              <Text c="carbonBlack.5" style={{ fontFamily: 'var(--font-work-sans, sans-serif)' }}>
                {profile?.email}
              </Text>
            </Stack>
          </Group>
        </Paper>

        {/* Metric Grid */}
        <Stack gap="xs">
          <Title order={3} fw={600} c="carbonBlack.8" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
            Clinical Overview
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Paper withBorder radius="md" p="md" style={{ borderColor: 'var(--mantine-color-carbonBlack-1)' }}>
              <Text c="primary.7" fw={600} size="sm" tt="uppercase" lts="0.05em" style={{ fontFamily: 'var(--font-work-sans, sans-serif)' }}>
                Total Sessions
              </Text>
              <Text mt="xs" size="xl" fw={700} c="carbonBlack.9">
                {totalSessions}
              </Text>
            </Paper>
            <Paper withBorder radius="md" p="md" style={{ borderColor: 'var(--mantine-color-carbonBlack-1)' }}>
              <Text c="primary.7" fw={600} size="sm" tt="uppercase" lts="0.05em" style={{ fontFamily: 'var(--font-work-sans, sans-serif)' }}>
                Max Session XP
              </Text>
              <Text mt="xs" size="xl" fw={700} c="carbonBlack.9">
                {maxXP} XP
              </Text>
            </Paper>
            <Paper withBorder radius="md" p="md" style={{ borderColor: 'var(--mantine-color-carbonBlack-1)' }}>
              <Text c="primary.7" fw={600} size="sm" tt="uppercase" lts="0.05em" style={{ fontFamily: 'var(--font-work-sans, sans-serif)' }}>
                Average Session XP
              </Text>
              <Text mt="xs" size="xl" fw={700} c="carbonBlack.9">
                {Math.round(avgXP)} XP
              </Text>
            </Paper>
          </SimpleGrid>
        </Stack>

        {/* Growth Chart */}
        <Stack gap="xs">
          <Title order={3} fw={600} c="carbonBlack.8" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
            Session XP Progression
          </Title>
          <Paper withBorder radius="md" p="md" style={{ borderColor: 'var(--mantine-color-carbonBlack-1)' }}>
            {chartData.length > 0 ? (
              <LineChart
                h={300}
                data={chartData}
                dataKey="date"
                series={[{ name: 'xp_earned', color: 'primary.6', label: 'XP Earned' }]}
                curveType="monotone"
                withDots={true}
                strokeWidth={2}
              />
            ) : (
              <Text c="carbonBlack.4" ta="center" py="xl" style={{ fontFamily: 'var(--font-work-sans, sans-serif)' }}>
                No session data available yet.
              </Text>
            )}
          </Paper>
        </Stack>

        {/* Recent Activity Table */}
        <Stack gap="xs">
          <Title order={3} fw={600} c="carbonBlack.8" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
            Recent Activity
          </Title>
          <Paper withBorder radius="md" style={{ borderColor: 'var(--mantine-color-carbonBlack-1)', overflow: 'hidden' }}>
            <Table horizontalSpacing="md" verticalSpacing="sm">
              <Table.Thead bg="carbonBlack.0">
                <Table.Tr>
                  <Table.Th style={{ fontFamily: 'var(--font-work-sans, sans-serif)', color: 'var(--mantine-color-carbonBlack-6)', fontWeight: 600 }}>Date</Table.Th>
                  <Table.Th style={{ fontFamily: 'var(--font-work-sans, sans-serif)', color: 'var(--mantine-color-carbonBlack-6)', fontWeight: 600 }}>Exercise Type</Table.Th>
                  <Table.Th style={{ fontFamily: 'var(--font-work-sans, sans-serif)', color: 'var(--mantine-color-carbonBlack-6)', fontWeight: 600 }}>Result Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentSessions.length > 0 ? (
                  recentSessions.map((session, index) => {
                    const isSuccess = (session.xp_earned || 0) >= 50;
                    return (
                      <Table.Tr key={session.id || index}>
                        <Table.Td style={{ fontFamily: 'var(--font-work-sans, sans-serif)', color: 'var(--mantine-color-carbonBlack-8)' }}>
                          {new Date(session.created_at).toLocaleDateString()}
                        </Table.Td>
                        <Table.Td style={{ fontFamily: 'var(--font-work-sans, sans-serif)', color: 'var(--mantine-color-carbonBlack-8)', textTransform: 'capitalize' }}>
                          {session.exercise_type?.replace(/_/g, ' ') || 'Unknown'}
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            color={isSuccess ? 'successGreen.6' : 'warningAmber.6'}
                            variant="light"
                            radius="sm"
                            style={{ fontFamily: 'var(--font-work-sans, sans-serif)' }}
                          >
                            {isSuccess ? 'Optimal' : 'Needs Work'}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={3} ta="center" py="md" style={{ fontFamily: 'var(--font-work-sans, sans-serif)', color: 'var(--mantine-color-carbonBlack-4)' }}>
                      No recent activity.
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Stack>

        </Stack>
      </Container>
    </Box>
  );
}
