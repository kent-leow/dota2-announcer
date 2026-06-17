import { GameStatusState, RoshanStatus } from './gameStatusTypes';

let state: GameStatusState = {
  daytime: true,
  roshan: { state: 'alive', endSeconds: 0 },
};

export function updateFromGsi(daytime: boolean, roshanState: string, roshanStateEndSeconds: number): void {
  state.daytime = daytime;

  const mapped = roshanState === 'respawn_base' ? 'respawn_base'
    : roshanState === 'respawn_variable' ? 'respawn_variable'
    : 'alive';
  state.roshan = { state: mapped, endSeconds: roshanStateEndSeconds };
}

export function getStatus(): GameStatusState {
  return { ...state, roshan: { ...state.roshan } };
}

export function clearAll(): void {
  state = { daytime: true, roshan: { state: 'alive', endSeconds: 0 } };
}

export function _resetForTesting(): void {
  clearAll();
}
