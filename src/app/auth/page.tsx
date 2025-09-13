import { WalletConnect } from '@/components/auth/WalletConnect'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to Zapp
          </h1>
          <p className="text-gray-400 text-lg">
            The next-gen social platform for gamers
          </p>
        </div>
        <WalletConnect />
      </div>
    </div>
  )
}