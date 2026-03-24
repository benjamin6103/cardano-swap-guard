import React, { useMemo, useState } from 'react';
import { useWallet } from '@meshsdk/react';
import { BlockfrostProvider, MeshTxBuilder } from '@meshsdk/core';
import { checkGuard } from '../utils/guards';
import { fetchCurrentPrice, fetch24hAvg, fetchCurrentTvl } from '../utils/api';

const USDM_POLICY =
  'c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d';
const TOKEN_PAIR = 'Aggregate.USDM_ADA';

const SwapForm: React.FC = () => {
  const { wallet, connected, connect, name } = useWallet();
  const [inputAmount, setInputAmount] = useState<number>(20);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>('');
  const [metrics, setMetrics] = useState<{
    currentPrice: number | null;
    avgPrice: number | null;
    deviation: number | null;
    slippage: number | null;
    liquidity: number | null;
  }>({
    currentPrice: null,
    avgPrice: null,
    deviation: null,
    slippage: null,
    liquidity: null,
  });

  const blockfrostProvider = useMemo(
    () => new BlockfrostProvider(process.env.REACT_APP_BLOCKFROST_ID || ''),
    []
  );

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  const handleSafeSwap = async () => {
    if (!connected) {
      return addLog('Connect a wallet first.');
    }
    if (!recipientAddress) {
      return addLog('Enter a recipient address.');
    }
    if (!process.env.REACT_APP_BLOCKFROST_ID) {
      return addLog('Missing Blockfrost ID. Configure REACT_APP_BLOCKFROST_ID.');
    }

    setLoading(true);
    setTxHash('');
    setLogs([]);

    try {
      addLog('Fetching oracle data from Charli3...');
      const [currentPrice, avgPrice, tvl] = await Promise.all([
        fetchCurrentPrice(USDM_POLICY),
        fetch24hAvg(TOKEN_PAIR),
        fetchCurrentTvl(USDM_POLICY),
      ]);

      if (!currentPrice || !avgPrice || !tvl) {
        return addLog('Oracle data incomplete. Aborting swap.');
      }

      // Simple constant-product style impact model
      const expectedOutput = inputAmount / currentPrice;
      const liquidityIn = tvl / 2; // Approximate ADA side
      const effectiveOutput = (liquidityIn * inputAmount) / (liquidityIn + inputAmount);
      const slippage = Math.abs((expectedOutput - effectiveOutput) / expectedOutput) * 100;
      const deviation =
        avgPrice > 0 ? Math.abs(((currentPrice - avgPrice) / avgPrice) * 100) : 0;

      setMetrics({
        currentPrice,
        avgPrice,
        deviation,
        slippage,
        liquidity: tvl,
      });

      const { safe, reasons } = checkGuard({
        inputAmount,
        expectedOutput,
        currentPrice,
        avgPrice,
        liquidityDepth: tvl,
        slippage,
      });

      reasons.forEach(addLog);
      if (!safe) {
        return addLog('Swap rejected by guard.');
      }

      addLog('Guard passed. Building transaction...');
      const changeAddress = await wallet.getChangeAddress();

      const tx = new MeshTxBuilder({
        fetcher: blockfrostProvider,
        submitter: blockfrostProvider,
      });

      tx.txOut(recipientAddress, [
        { unit: 'lovelace', quantity: Math.round(inputAmount * 1_000_000).toString() },
      ]);
      tx.changeAddress(changeAddress);
      const unsignedTx = await tx.complete();
      addLog('Transaction built. Requesting signature...');

      const signedTx = await wallet.signTx(unsignedTx, false);
      const hash = await wallet.submitTx(signedTx);
      setTxHash(hash);
      addLog(`Executed! Tx hash: ${hash}`);
    } catch (error) {
      console.error(error);
      addLog(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="hero fade-in">
        <div className="hero-text">
          <h1>Swap Guard Protocol</h1>
          <p>Deterministic pre-execution simulator for secure DeFi swaps on Cardano.</p>
        </div>
        {!connected ? (
          <button
            type="button"
            className="btn primary"
            onClick={() => connect('eternl')}
          >
            Connect Eternl
          </button>
        ) : (
          <div className="wallet-chip">
            <span className="pill-dot connected" />
            <span>{name}</span>
          </div>
        )}
      </div>

      <div className="layout">
        <div className="glass-card fade-in" style={{ animationDelay: '0.1s' }}>
          <h2>Swap Validation</h2>
          <form
            className="swap-form"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSafeSwap();
            }}
          >
            <div className="form-group-card field">
              <div className="field-header">
                <label htmlFor="amount">You Pay</label>
                <span>ADA (Native)</span>
              </div>
              <div className="input-wrapper">
                <input
                  id="amount"
                  type="number"
                  value={inputAmount}
                  min={0.1}
                  step={0.1}
                  disabled={loading}
                  onChange={(e) => setInputAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="swap-separator">
              <div className="swap-separator-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 20L12 4M12 20L18 14M12 20L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div className="form-group-card field">
              <div className="field-header">
                <label htmlFor="recipient">To Address</label>
                <span>Recipient</span>
              </div>
              <div className="input-wrapper">
                <input
                  id="recipient"
                  type="text"
                  value={recipientAddress}
                  disabled={loading}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="addr_test1..."
                  spellCheck="false"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn primary"
              disabled={loading || !connected}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Simulating & Broadcasting...
                </>
              ) : (
                'Run Safe Swap'
              )}
            </button>
          </form>

          <div className="logs-panel">
            {logs.length === 0 ? (
              <p className="logs-empty">
                Awaiting swap configuration...
              </p>
            ) : (
              <ul className="logs-list">
                {logs.map((log, i) => {
                  const isError = log.includes('Error') || log.includes('rejected') || log.includes('missing') || log.includes('Aborting');
                  const isSuccess = log.includes('Executed') || log.includes('passed');
                  return (
                    <li key={i} className={isError ? 'error' : isSuccess ? 'success' : ''}>
                      {log}
                    </li>
                  );
                })}
              </ul>
            )}

            {txHash && (
              <p className="tx-link">
                View on
                <a
                  href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cardanoscan
                </a>
              </p>
            )}
          </div>
        </div>

        <aside className="glass-card fade-in" style={{ animationDelay: '0.2s' }}>
          <h3>Charli3 Oracle Data</h3>
          <p className="metrics-caption">Live on-chain metrics snapshot.</p>
          <dl className="metrics-grid">
            <div className="metric-item">
              <dt>Current price</dt>
              <dd>
                {metrics.currentPrice !== null
                  ? metrics.currentPrice.toFixed(4) + ' ADA/USDM'
                  : '--'}
              </dd>
            </div>
            <div className="metric-item">
              <dt>24h avg price</dt>
              <dd>
                {metrics.avgPrice !== null
                  ? metrics.avgPrice.toFixed(4) + ' ADA/USDM'
                  : '--'}
              </dd>
            </div>
            <div className="metric-item">
              <dt>Deviation</dt>
              <dd>
                {metrics.deviation !== null
                  ? metrics.deviation.toFixed(2) + ' %'
                  : '--'}
              </dd>
            </div>
            <div className="metric-item">
              <dt>Estimated slippage</dt>
              <dd>
                {metrics.slippage !== null
                  ? metrics.slippage.toFixed(2) + ' %'
                  : '--'}
              </dd>
            </div>
            <div className="metric-item">
              <dt>Liquidity (TVL)</dt>
              <dd>
                {metrics.liquidity !== null
                  ? (metrics.liquidity / 1_000_000).toFixed(2) + ' ADA'
                  : '--'}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
};

export default SwapForm;