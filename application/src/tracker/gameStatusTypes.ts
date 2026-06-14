export interface RoshanStatus {
  state: 'alive' | 'respawn_base' | 'respawn_extra';
  endSeconds: number;
}

export interface GameStatusState {
  daytime: boolean;
  roshan: RoshanStatus;
}
