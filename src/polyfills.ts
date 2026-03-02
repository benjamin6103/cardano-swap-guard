import { Buffer } from 'buffer';
import process from 'process';

const g: any = typeof globalThis !== 'undefined' ? globalThis : window;

// Ensure common Node globals exist before other modules execute.
g.global = g.global || g;
g.process = g.process || process;
g.Buffer = g.Buffer || Buffer;

