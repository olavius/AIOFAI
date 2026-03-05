import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-gold">◈</span>
          <h1 className="text-2xl font-bold text-cream mt-2">CFO Intelligence Platform</h1>
          <p className="text-cream/60 text-sm mt-1">Ascando Partners</p>
        </div>
        <SignIn
          appearance={{
            variables: {
              colorBackground: '#161B22',
              colorText: '#FBFAF6',
              colorPrimary: '#2D7A72',
              colorInputBackground: '#1C2331',
              colorInputText: '#FBFAF6',
            },
          }}
        />
      </div>
    </div>
  )
}
