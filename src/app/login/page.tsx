import { login, signup, loginWithGoogle } from './actions'
import { Box, Button, Container, Paper, PasswordInput, TextInput, Title, Text, Stack, Divider } from '@mantine/core'
import { IconBrandGoogle } from '@tabler/icons-react'

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const searchParams = await props.searchParams;

  return (
    <Container size={420} my={40}>
      <Title ta="center" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
        Welcome back!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Log in to track your hand rehabilitation progress
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form>
          <Stack>
            <TextInput
              label="Full Name (for new accounts)"
              name="full_name"
              placeholder="John Doe"
            />
            <TextInput
              label="Email"
              name="email"
              type="email"
              placeholder="you@mantine.dev"
              required
            />
            <PasswordInput
              label="Password"
              name="password"
              placeholder="Your password"
              required
            />
            {searchParams?.error && (
              <Text c="red" size="sm" ta="center" mt="sm">
                {searchParams.error}
              </Text>
            )}
            <Box mt="xs2" style={{ display: 'flex', gap: '1rem' }}>
              <Button fullWidth variant="default" type="submit" formAction={signup}>
                Sign up
              </Button>
              <Button fullWidth type="submit" formAction={login}>
                Log in
              </Button>
            </Box>
          </Stack>
        </form>

        <Divider label="Or continue with" labelPosition="center" my="md" />

        <form>
          <Button fullWidth variant="default" type="submit" formAction={loginWithGoogle} leftSection={<IconBrandGoogle size={18} />}>
            Sign in with Google
          </Button>
        </form>
      </Paper>
    </Container>
  )
}
