export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col justify-center gap-4 p-8 font-mono text-sm">
      <h1 className="text-lg font-semibold">personal-telegram</h1>
      <p className="text-neutral-500">
        Webhook: <code className="text-neutral-800">POST /api/telegram/webhook</code>
      </p>
      <p className="text-neutral-500">
        Notify: <code className="text-neutral-800">POST /api/notify</code> (Bearer secret)
      </p>
      <p className="text-neutral-400">
        DM your bot with <code>/id</code> after deploy to learn your chat id.
      </p>
    </main>
  );
}
