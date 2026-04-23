// 'use client';

// import type { ChartPoint } from '@/hooks/useGamification';

// type ProgressGraphProps = {
//   data: ChartPoint[];
// };

// export function ProgressGraph({ data }: ProgressGraphProps) {
//   const maxXP = Math.max(1, ...data.map((point) => point.xpEarned));

//   return (
//     <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
//       <div className="flex items-center justify-between">
//         <p className="text-zinc-400 text-xs tracking-widest uppercase">7-Day XP</p>
//         <p className="font-mono text-xs text-zinc-300">
//           MAX {maxXP}
//         </p>
//       </div>

//       <div className="mt-4 grid grid-cols-7 gap-2 items-end h-28">
//         {data.map((point) => {
//           const heightPct = Math.max(6, (point.xpEarned / maxXP) * 100);
//           return (
//             <div key={point.date} className="flex flex-col items-center gap-2">
//               <div className="h-20 w-full flex items-end">
//                 <div
//                   className={`w-full rounded-md ${point.isToday ? 'bg-zinc-300' : 'bg-zinc-700'}`}
//                   style={{ height: `${heightPct}%` }}
//                   title={`${point.label}: ${point.xpEarned} XP`}
//                 />
//               </div>
//               <span className="text-[10px] text-zinc-400 tracking-widest">{point.label}</span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


'use client';

import { Box, Text, Group, SimpleGrid, Flex } from '@mantine/core';
import type { ChartPoint } from '@/hooks/useGamification';

type ProgressGraphProps = {
  data: ChartPoint[];
};

export function ProgressGraph({ data }: ProgressGraphProps) {
  const maxXP = Math.max(1, ...data.map((point) => point.xpEarned));

  return (
    <Box p="md">
      <Group justify="space-between" align="center">
        <Text size="xs" tt="uppercase" lts="0.1em" c="carbonBlack.4" fw={600}>
          7-Day XP
        </Text>
        <Text ff="monospace" size="xs" c="carbonBlack.5">
          MAX {maxXP}
        </Text>
      </Group>

      <SimpleGrid cols={7} spacing="xs" mt="md" h={112} style={{ alignItems: 'flex-end' }}>
        {data.map((point) => {
          const heightPct = Math.max(6, (point.xpEarned / maxXP) * 100);
          return (
            <Flex key={point.date} direction="column" align="center" gap="xs" h="100%">
              <Box h={80} w="100%" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Box
                  w="100%"
                  bg={point.isToday ? 'primary.5' : 'carbonBlack.1'}
                  style={{
                    height: `${heightPct}%`,
                    borderRadius: 'var(--mantine-radius-sm)',
                    transition: 'height 0.4s ease'
                  }}
                  title={`${point.label}: ${point.xpEarned} XP`}
                />
              </Box>
              <Text size="xs" ff="monospace" c="carbonBlack.4" lts="0.05em">
                {point.label}
              </Text>
            </Flex>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}