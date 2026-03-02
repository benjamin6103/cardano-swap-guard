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
    <div className="swap-shell">
      <div className="swap-header">
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

      <div className="swap-body">
        <div className="swap-main">
          <form
            className="swap-form"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSafeSwap();
            }}
          >
            <div className="field">
              <label htmlFor="amount">ADA input</label>
              <input
                id="amount"
                type="number"
                value={inputAmount}
                min={0.1}
                step={0.1}
                onChange={(e) => setInputAmount(parseFloat(e.target.value) || 0)}
              />
              <small>Amount of ADA you intend to swap.</small>
            </div>

            <div className="field">
              <label htmlFor="recipient">Recipient address</label>
              <input
                id="recipient"
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="addr_test1..."
              />
              <small>Preprod address that will receive the output.</small>
            </div>

            <button
              type="submit"
              className="btn secondary"
              disabled={loading || !connected}
            >
              {loading ? 'Running checks...' : 'Run Safe Swap'}
            </button>
          </form>

          <div className="logs-panel">
            <h3>Guard logs</h3>
            {logs.length === 0 ? (
              <p className="logs-empty">
                No checks run yet. Configure a swap to see details.
              </p>
            ) : (
              <ul className="logs-list">
                {logs.map((log, i) => (
                  <li key={i}>{log}</li>
                ))}
              </ul>
            )}

            {txHash && (
              <p className="tx-link">
                View transaction on{' '}
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

        <aside className="metrics-panel">
          <h3>Market snapshot</h3>
          <p className="metrics-caption">Live data from Charli3 oracle.</p>
          <dl className="metrics-list">
            <div>
              <dt>Current price</dt>
              <dd>
                {metrics.currentPrice !== null
                  ? metrics.currentPrice.toFixed(4) + ' ADA / USDM'
                  : '--'}
              </dd>
            </div>
            <div>
              <dt>24h avg price</dt>
              <dd>
                {metrics.avgPrice !== null
                  ? metrics.avgPrice.toFixed(4) + ' ADA / USDM'
                  : '--'}
              </dd>
            </div>
            <div>
              <dt>Deviation</dt>
              <dd>
                {metrics.deviation !== null
                  ? metrics.deviation.toFixed(2) + ' %'
                  : '--'}
              </dd>
            </div>
            <div>
              <dt>Estimated slippage</dt>
              <dd>
                {metrics.slippage !== null
                  ? metrics.slippage.toFixed(2) + ' %'
                  : '--'}
              </dd>
            </div>
            <div>
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
    </div>
  );
};

export default SwapForm;