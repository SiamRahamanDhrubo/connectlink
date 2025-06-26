
import { MessageCircle, Users, Shield, Zap } from "lucide-react";

export const WelcomeScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-900">
      <div className="text-center max-w-md px-6">
        <div className="mb-8">
          <MessageCircle className="w-24 h-24 text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to ConnectLink
          </h1>
          <p className="text-slate-400 text-lg">
            The future of messaging is here
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl">
            <Zap className="w-8 h-8 text-yellow-400" />
            <div className="text-left">
              <h3 className="font-semibold text-white">Lightning Fast</h3>
              <p className="text-sm text-slate-400">Instant message delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl">
            <Shield className="w-8 h-8 text-green-400" />
            <div className="text-left">
              <h3 className="font-semibold text-white">Secure & Private</h3>
              <p className="text-sm text-slate-400">End-to-end encryption</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl">
            <Users className="w-8 h-8 text-purple-400" />
            <div className="text-left">
              <h3 className="font-semibold text-white">Smart Groups</h3>
              <p className="text-sm text-slate-400">Intelligent chat organization</p>
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-sm">
          Select a conversation to start messaging
        </p>
      </div>
    </div>
  );
};
