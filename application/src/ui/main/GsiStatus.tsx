import { useState, useEffect, useCallback } from 'react';

export function GsiStatus() {
  const [installed, setInstalled] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    const [inst, conn] = await Promise.all([
      window.electronAPI.gsiIsInstalled(),
      window.electronAPI.gsiIsConnected(),
    ]);
    setInstalled(inst);
    setConnected(conn);
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleInstall = async () => {
    setActionLoading(true);
    setMessage(null);
    const result = await window.electronAPI.gsiInstall();
    setActionLoading(false);
    if (result.success) {
      setMessage('GSI config installed. Restart Dota 2.');
      setInstalled(true);
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  const handleUninstall = async () => {
    setActionLoading(true);
    setMessage(null);
    const result = await window.electronAPI.gsiUninstall();
    setActionLoading(false);
    if (result.success) {
      setMessage('GSI config removed.');
      setInstalled(false);
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  return (
    <div data-testid="gsi-status" className="bg-dota-dark rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-dota-gold text-sm font-semibold uppercase tracking-wide">GSI Status</h3>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-dota-green' : 'bg-dota-red'}`} />
          <span className={`text-xs font-medium ${connected ? 'text-dota-green' : 'text-dota-red'}`}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!installed ? (
          <button
            onClick={handleInstall}
            disabled={actionLoading}
            data-testid="gsi-install-btn"
            className="px-3 py-1.5 rounded text-xs font-medium bg-dota-gold/20 text-dota-gold border border-dota-gold/40 hover:bg-dota-gold/30 transition-colors disabled:opacity-50"
          >
            {actionLoading ? 'Working...' : 'Install GSI'}
          </button>
        ) : (
          <button
            onClick={handleUninstall}
            disabled={actionLoading}
            data-testid="gsi-uninstall-btn"
            className="px-3 py-1.5 rounded text-xs font-medium bg-dota-red/20 text-dota-red border border-dota-red/40 hover:bg-dota-red/30 transition-colors disabled:opacity-50"
          >
            {actionLoading ? 'Working...' : 'Uninstall GSI'}
          </button>
        )}
        <span className={`text-xs ${installed ? 'text-dota-green' : 'text-dota-grey/60'}`}>
          {installed ? 'Config installed' : 'Not installed'}
        </span>
      </div>

      {message && (
        <p data-testid="gsi-message" className={`text-xs ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
