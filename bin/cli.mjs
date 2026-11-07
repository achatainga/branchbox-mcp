#!/usr/bin/env node
import { BranchBoxEngine } from '../src/engine.mjs';

const engine = new BranchBoxEngine();
await engine.init();
const cmd = process.argv.slice(2).join(' ') || 'SELECT 1';
console.log(JSON.stringify(engine.checkCommandSafety(cmd), null, 2));
